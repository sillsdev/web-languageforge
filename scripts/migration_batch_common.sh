# shellcheck shell=bash
# shellcheck disable=SC2004  # ${P[...]} inside (( )) on purpose: under set -u a missing key is
#                               an error, where a bare P[...] would quietly read as 0.
# Shared code for migrate_custom_field_projects.sh and migrate_non_custom_field_projects.sh.
# Sourced by them, not run. The calling script sets, before sourcing this file:
#
#     SCRIPT_NAME     its own name, for messages
#     PROGRESS_FILE   the progress log's file name (created in the current directory)
#     MODE            "custom" or "non-custom"
#
# WHERE THINGS LIVE
#   Everything this writes goes in the directory it is run from:
#       $PROGRESS_FILE        one line per finished project (or, for custom fields, per finished stage)
#       migration-logs/       the full output of every migration run, one file per run
#   The migration itself runs inside the app container, through
#       ${MIGRATION_APP_EXEC:-docker compose exec -T app}
#   started from the root of this repository so that docker compose finds docker-compose.yml.
#
# ENVIRONMENT
#   MIGRATION_APP_EXEC   command prefix that runs a command in the app container
#   MIGRATION_SCRIPT     path of copy_project_for_migration.py INSIDE the container
#                        (default /var/www/scripts/copy_project_for_migration.py)
#   LEXBOX_PASSWORD      passed through to the container when set, as the migration script reads it

REPO_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
WORK_DIR=$PWD
LOG_DIR="$WORK_DIR/migration-logs"
MIGRATION_SCRIPT=${MIGRATION_SCRIPT:-/var/www/scripts/copy_project_for_migration.py}
HELPER_SCRIPT="$(dirname -- "$MIGRATION_SCRIPT")/migration_batch_helper.py"
read -r -a APP_EXEC <<<"${MIGRATION_APP_EXEC:-docker compose exec -T app}"

# Options a batch may pass through to the migration script. Everything else it controls itself:
# --resume, --force, --no-init, --dry-run and --custom-fields-only are chosen per project, and the
# per-project options (--project-name, --ws-vernacular, --ws-analysis) make no sense for a batch.
# --no-assets and --no-send-receive would leave every project half done by design.
PASSABLE_OPTIONS=(--lexbox-host --lexbox-user --lexbox-password --lexbox-auth --lexbox-timeout --sr-timeout --suffix)

LIST_FILE=""
FORWARD=()
CODES=()
declare -A LIST_ENTRIES=() LIST_COMMENTS=() LIST_ID=()
declare -A NEW_CODE=() LEXBOX_CODE=() HG_URL=()
declare -A P=()  # the last probe's results
PROBLEMS=()      # what the last verification found wrong
WARNINGS=()      # collected for the summary at the end
MIGRATED=0

# --------------------------------------------------------------------------- #
# messages
# --------------------------------------------------------------------------- #

say() { printf '%s\n' "$*"; }
heading() { printf '\n=== %s ===\n' "$*"; }
die() {
	printf '%s: ERROR: %s\n' "$SCRIPT_NAME" "$*" >&2
	exit 1
}
warn() {
	WARNINGS+=("$*")
	printf 'WARNING: %s\n' "$*" >&2
}

# Stop the whole batch over one project. Everything finished so far is in the progress log, so
# running the script again carries on from this project.
fail() {
	local code=$1
	shift
	printf '\n%s: STOPPED at %s\n' "$SCRIPT_NAME" "$code" >&2
	local line
	for line in "$@"; do
		printf '  %s\n' "$line" >&2
	done
	printf '\nProjects finished before this one are recorded in %s;\n' "$PROGRESS_FILE" >&2
	printf 'run the script again with the same list to carry on from %s.\n' "$code" >&2
	exit 1
}

on_interrupt() {
	printf '\n%s: interrupted.\n' "$SCRIPT_NAME" >&2
	printf 'A migration started inside the app container keeps running when this script is stopped.\n' >&2
	printf 'Running the script again is safe: it waits for nothing, but refuses to touch a project\n' >&2
	printf 'whose migration or Send/Receive is still in progress, and says so.\n' >&2
	exit 130
}

usage() {
	cat <<EOF
Usage: $SCRIPT_NAME LIST [-- MIGRATION-OPTIONS]
       $SCRIPT_NAME -   [-- MIGRATION-OPTIONS]      (read the list from stdin)

LIST is a projectsWorthMigrating file: tab-separated lines of
    projectCode  entryCount  commentCount  mongoObjectId  [anything else, ignored]
Blank lines and lines starting with # are skipped.

MIGRATION-OPTIONS are passed to copy_project_for_migration.py for every project. Allowed:
    ${PASSABLE_OPTIONS[*]}
LEXBOX_PASSWORD is passed through from the environment when set.

Progress is recorded in ./$PROGRESS_FILE and run output in ./migration-logs/.
Running the script again skips finished projects and carries on where it stopped.
EOF
	usage_details
}

# --------------------------------------------------------------------------- #
# setup
# --------------------------------------------------------------------------- #

parse_common_args() {
	while (($#)); do
		case $1 in
		-h | --help)
			usage
			exit 0
			;;
		--)
			shift
			FORWARD=("$@")
			break
			;;
		-)
			[[ -z $LIST_FILE ]] || die "give exactly one list (see --help)"
			LIST_FILE=-
			shift
			;;
		-*) die "unknown option '$1' (migration options go after --; see --help)" ;;
		*)
			[[ -z $LIST_FILE ]] || die "give exactly one list (see --help)"
			LIST_FILE=$1
			shift
			;;
		esac
	done
	[[ -n $LIST_FILE ]] || die "no project list given (see --help)"
	validate_forwarded
}

validate_forwarded() {
	local i=0 arg name allowed
	while ((i < ${#FORWARD[@]})); do
		arg=${FORWARD[i]}
		name=${arg%%=*}
		allowed=0
		local option
		for option in "${PASSABLE_OPTIONS[@]}"; do
			[[ $name == "$option" ]] && allowed=1
		done
		((allowed)) || die "'$name' cannot be passed to the migration script from a batch; allowed: ${PASSABLE_OPTIONS[*]}"
		if [[ $arg == *=* ]]; then
			((i += 1))
		else
			((i + 1 < ${#FORWARD[@]})) || die "$name needs a value"
			((i += 2))
		fi
	done
}

# Read the whole list before anything else runs, so that a list on stdin is never shared with the
# commands the loop runs.
read_list() {
	local -a lines=()
	if [[ $LIST_FILE == - ]]; then
		mapfile -t lines
	else
		[[ -f $LIST_FILE && -r $LIST_FILE ]] || die "cannot read $LIST_FILE"
		mapfile -t lines <"$LIST_FILE"
	fi

	local number=0 line code entries comments id _rest
	for line in "${lines[@]}"; do
		((number += 1))
		line=${line%$'\r'}
		[[ -z ${line//[[:space:]]/} || $line == \#* ]] && continue
		IFS=$'\t' read -r code entries comments id _rest <<<"$line"
		[[ -n $code && $code != *[[:space:]]* ]] || die "line $number: no project code"
		[[ $entries =~ ^[0-9]+$ ]] || die "line $number ($code): entry count '$entries' is not a number"
		[[ $comments =~ ^[0-9]+$ ]] || die "line $number ($code): comment count '$comments' is not a number"
		[[ $id =~ ^[0-9a-f]{24}$ ]] || die "line $number ($code): '$id' is not a Mongo ObjectId"
		[[ -z ${LIST_ID[$code]:-} ]] || die "line $number: $code is listed twice"
		CODES+=("$code")
		LIST_ENTRIES[$code]=$entries
		LIST_COMMENTS[$code]=$comments
		LIST_ID[$code]=$id
	done
	((${#CODES[@]})) || die "no projects in $LIST_FILE"
}

init() {
	parse_common_args "$@"
	read_list
	command -v "${APP_EXEC[0]}" >/dev/null || die "'${APP_EXEC[0]}' not found (set MIGRATION_APP_EXEC?)"
	mkdir -p -- "$LOG_DIR"

	# Two runs at once would migrate the same projects twice over. The lock lasts as long as this
	# process, because file descriptor 9 stays open until it exits.
	exec 9>>"$WORK_DIR/$PROGRESS_FILE"
	flock -n 9 || die "another run is already using $WORK_DIR/$PROGRESS_FILE"

	trap on_interrupt INT TERM
}

# --------------------------------------------------------------------------- #
# progress log
# --------------------------------------------------------------------------- #

# Non-custom projects have one stage, recorded as the bare project code. Custom field projects have
# two, recorded as "code<TAB>stage1" and "code<TAB>stage2".
progress_line() {
	if [[ -n ${2:-} ]]; then
		printf '%s\t%s' "$1" "$2"
	else
		printf '%s' "$1"
	fi
}
progress_has() {
	grep -qxF -- "$(progress_line "$1" "${2:-}")" "$WORK_DIR/$PROGRESS_FILE"
}
progress_add() {
	printf '%s\n' "$(progress_line "$1" "${2:-}")" >>"$WORK_DIR/$PROGRESS_FILE"
}

# --------------------------------------------------------------------------- #
# running things in the app container
# --------------------------------------------------------------------------- #

app_exec() {
	(cd -- "$REPO_ROOT" && "${APP_EXEC[@]}" "$@")
}
app_python() {
	local env_args=()
	[[ -n ${LEXBOX_PASSWORD+set} ]] && env_args=(env "LEXBOX_PASSWORD=$LEXBOX_PASSWORD")
	app_exec "${env_args[@]}" python3 "$@"
}

new_log() {
	printf '%s/%s.%s.%s.log' "$LOG_DIR" "$1" "$2" "$(date +%Y%m%d-%H%M%S)"
}

# probe CODE [EXTRAS] -- fill P with the helper's description of a project and its copy.
# shellcheck disable=SC2034  # NEW_CODE, LEXBOX_CODE and HG_URL are read by the calling scripts
probe() {
	local code=$1 extras=${2:-} output line
	local args=(probe "$code")
	[[ -n $extras ]] && args+=(--with "$extras")
	output=$(app_python "$HELPER_SCRIPT" "${args[@]}" -- "${FORWARD[@]}" </dev/null) || return 1
	P=()
	while IFS= read -r line; do
		[[ $line == *=* ]] && P[${line%%=*}]=${line#*=}
	done <<<"$output"
	[[ -n ${P[new_code]:-} ]] || return 1
	NEW_CODE[$code]=${P[new_code]}
	LEXBOX_CODE[$code]=${P[lexbox_code]}
	HG_URL[$code]=${P[hg_url]}
}

probe_or_fail() {
	probe "$@" || fail "$1" "Could not inspect the project (the error is above). Is the app container running?"
}

# run_logged LOG COMMAND... -- run a command in the container, showing and saving its output, and
# return its exit status.
run_logged() {
	local log=$1 status
	shift
	say "  log: $log"
	set +e
	app_python "$@" </dev/null 2>&1 | tee -- "$log"
	status=${PIPESTATUS[0]}
	set -e
	return "$status"
}

run_migration() {
	local code=$1 log=$2
	shift 2
	say "  running: copy_project_for_migration.py $code $*"
	run_logged "$log" "$MIGRATION_SCRIPT" "$code" "$@" "${FORWARD[@]}"
}

run_finish() {
	local code=$1 log=$2
	say "  running: the remaining asset steps (move assets into webwork, Send/Receive #2)"
	run_logged "$log" "$HELPER_SCRIPT" finish "$code" -- "${FORWARD[@]}"
}

# --------------------------------------------------------------------------- #
# reading a probe
# --------------------------------------------------------------------------- #

copy_synced() {
	# The copy starts with the source's lastSyncedDate, and LfMerge sets it at the end of every
	# successful Send/Receive. So a later date than the source's means one has completed.
	[[ ${P[copy_exists]} == 1 ]] && ((${P[copy_last_synced]} > ${P[source_last_synced]}))
}

leftovers_exist() {
	[[ ${P[copy_exists]} == 1 ]] || ((${P[copy_collections]} > 0))
}

# Non-empty output (the reason) if the project must not be touched right now.
busy_reason() {
	if [[ ${P[migration_running]} == 1 ]]; then
		printf 'a migration of this project is still running in the app container'
	elif [[ ${P[queue_present]} == 1 ]]; then
		printf 'a Send/Receive of %s is queued but has not started (is the lfmerge container running?)' "${P[new_code]}"
	elif [[ ${P[sr_class]} == in_progress ]]; then
		printf 'a Send/Receive of %s is in progress (SRState=%s)' "${P[new_code]}" "${P[sr_state]}"
	elif [[ ${P[sr_class]} == unknown ]]; then
		printf "the Send/Receive state of %s is '%s', which is neither finished nor failed" "${P[new_code]}" "${P[sr_state]}"
	fi
}

# Whether an existing LexBox project with the copy's code was created by an earlier run of this
# migration. The only record of that is the logs: the migration logs this line just before it
# calls initFwDataProject, which is how a 504 can leave a project behind with nothing on the
# Language Forge side.
lexbox_created_by_us() {
	grep -qsF "Initializing LexBox project" "$LOG_DIR/$1".*.log
}

# How to (re)start a migration whose first Send/Receive has not happened yet. Sets RESTART_FLAGS,
# or fails if a LexBox project is in the way. (Not printed for capture: fail has to be able to
# stop this script, not a subshell.)
set_restart_flags() {
	local code=$1
	RESTART_FLAGS=()
	if [[ ${P[lexbox_exists]} == 1 ]]; then
		lexbox_created_by_us "$code" || fail "$code" \
			"LexBox already has a project '${P[lexbox_code]}', and nothing in $LOG_DIR shows this script creating it." \
			"It may be left over from a test. Delete it in LexBox and run this script again, or, if you are" \
			"sure it is an empty project from an earlier attempt at this migration, run by hand:" \
			"  copy_project_for_migration.py $code --force --no-init"
		# Rebuild the Language Forge side and keep the LexBox project. --force also clears away
		# whatever an interrupted attempt left in Mongo.
		RESTART_FLAGS=(--force --no-init)
	elif leftovers_exist; then
		RESTART_FLAGS=(--force)
	fi
}

# Whether a LexBox project with the copy's code is one this batch may use. Stage 1 of a custom
# field migration creates it, so once that is recorded it is ours by definition.
lexbox_project_in_the_way() {
	local code=$1
	[[ ${P[lexbox_exists]} == 1 ]] || return 1
	[[ $MODE == custom ]] && progress_has "$code" stage1 && return 1
	copy_synced && return 1
	! lexbox_created_by_us "$code"
}

# --------------------------------------------------------------------------- #
# verification
# --------------------------------------------------------------------------- #

# check_count CODE WHAT LISTED -- compare one count in the copy with the list, and with the source.
check_count() {
	local code=$1 what=$2 listed=$3 copied=${P[copy_$2]} now=${P[source_$2]}
	[[ $copied == "$listed" ]] && return 0
	if [[ $copied == "$now" ]]; then
		warn "$code: the list says $listed $what but the source now has $now; the copy matches the source"
		return 0
	fi
	PROBLEMS+=("$what: the copy has $copied, the list says $listed, and the source has $now")
}

# Checks that apply to the copy at any stage, against a fresh probe.
check_copy() {
	local code=$1
	[[ ${P[copy_exists]} == 1 ]] || {
		PROBLEMS+=("the copy ${P[new_code]} does not exist")
		return
	}
	[[ ${P[copy_sr]} == "${P[lexbox_code]}" ]] ||
		PROBLEMS+=("the copy's sendReceiveProjectIdentifier is '${P[copy_sr]}', expected '${P[lexbox_code]}'")
	check_count "$code" entries "${LIST_ENTRIES[$code]}"
	check_count "$code" comments "${LIST_COMMENTS[$code]}"
	# Compared with the source rather than the list, which has no such column. After a Send/Receive
	# this is the check that catches custom field data LfMerge skipped.
	[[ ${P[copy_cf_entries]} == "${P[source_cf_entries]}" ]] ||
		PROBLEMS+=("entries with custom field data: the copy has ${P[copy_cf_entries]}, the source has ${P[source_cf_entries]}")
}

# Checks for a migration that should be completely finished.
verify_finished() {
	local code=$1
	PROBLEMS=()
	probe_or_fail "$code"
	check_copy "$code"
	copy_synced || PROBLEMS+=("the copy has not completed a Send/Receive (its lastSyncedDate was never updated)")
	[[ ${P[sr_class]} == "done" ]] || PROBLEMS+=("the copy's Send/Receive state is '${P[sr_state]}', not finished")
	[[ ${P[assets_all_linked]} == 1 ]] ||
		PROBLEMS+=("the copy's assets are not linked into the Send/Receive work tree (audio: ${P[assets_audio]}, pictures: ${P[assets_pictures]})")
	report_verification "$code"
}

report_verification() {
	local code=$1
	if ((${#PROBLEMS[@]})); then
		fail "$code" "The migration ran, but the result does not check out:" "${PROBLEMS[@]/#/  - }" \
			"Investigate before going on. If the result is in fact correct, add this line to $PROGRESS_FILE" \
			"so that the next run skips it: $(progress_line "$code" "${VERIFIED_STAGE:-}")"
	fi
	say "  verified: ${P[copy_entries]} entries, ${P[copy_comments]} comments, ${P[copy_cf_entries]} with custom field data"
}

# --------------------------------------------------------------------------- #
# the stage that finishes a migration
# --------------------------------------------------------------------------- #

# migrate_to_finish CODE KIND -- take a project from wherever it is to fully migrated and verified.
# KIND is "whole" for a project without custom fields, or "stage2" for a custom field project whose
# stage 1 is done and whose custom fields have been committed. Records the stage when done.
migrate_to_finish() {
	local code=$1 kind=$2 stage="" log reason
	[[ $kind == stage2 ]] && stage=stage2
	VERIFIED_STAGE=$stage

	probe_or_fail "$code" lexbox
	check_source "$code"
	reason=$(busy_reason)
	[[ -z $reason ]] || fail "$code" "Not touching it: $reason." "Wait for it to finish, then run this script again."

	local action=migrate flags=()
	if ! copy_synced; then
		if ((${P[assets_links]} > 0)); then
			fail "$code" "The copy's assets are already linked into the Send/Receive work tree, but no Send/Receive" \
				"has completed. That should not happen; inspect ${P[new_code]} by hand."
		fi
		if [[ $kind == stage2 ]]; then
			[[ ${P[copy_exists]} == 1 ]] || fail "$code" "Stage 1 is recorded as done, but the copy ${P[new_code]} does not exist."
			[[ ${P[lexbox_exists]} == 1 ]] || fail "$code" "Stage 1 is recorded as done, but LexBox has no project '${P[lexbox_code]}'."
			flags=(--resume)
		else
			set_restart_flags "$code"
			flags=("${RESTART_FLAGS[@]}")
		fi
	elif [[ ${P[sr_class]} == failed ]]; then
		fail "$code" "The copy's last Send/Receive failed (SRState=${P[sr_state]}); see \`docker compose logs lfmerge\`." \
			"Once it is fixed, run this script again; it will finish the remaining asset steps."
	elif [[ ${P[assets_all_linked]} == 1 && ${P[sr_class]} == "done" ]] &&
		((${P[sr_state_mtime]} > ${P[assets_link_mtime]})); then
		# Everything ran, and a Send/Receive finished after the assets were linked: a previous run
		# was cut off after the migration but before it was verified.
		action=verify
	else
		# The first Send/Receive finished; the assets still need moving and pushing. Not --resume,
		# which deletes the work tree the assets may already have been moved into.
		action=finish
	fi

	case $action in
	migrate)
		log=$(new_log "$code" "${stage:-migrate}")
		if ! run_migration "$code" "$log" "${flags[@]}"; then
			fail "$code" "The migration failed; see $log"
		fi
		if [[ $kind == whole ]] && grep -q '^Paused for custom fields' "$log"; then
			fail "$code" "The migration stopped for custom fields, so this project belongs in the custom fields list." \
				"Its copy and LexBox project now exist; migrate_custom_field_projects.sh can carry it on."
		fi
		grep -q '^Done\. ' "$log" || fail "$code" "The migration exited without saying it was done; see $log"
		;;
	finish)
		log=$(new_log "$code" finish)
		run_finish "$code" "$log" || fail "$code" "Finishing the asset steps failed; see $log"
		;;
	verify)
		say "  the migration had already finished; verifying it"
		;;
	esac

	verify_finished "$code"
	progress_add "$code" "$stage"
	((MIGRATED += 1))
}

# The source has to be the project the list means, and must still be eligible.
check_source() {
	local code=$1
	[[ ${P[source_exists]} == 1 ]] || fail "$code" "There is no project '$code' in Mongo."
	[[ ${P[source_id]} == "${LIST_ID[$code]}" ]] ||
		fail "$code" "Project '$code' has _id ${P[source_id]}, but the list says ${LIST_ID[$code]}. Is the list for this database?"
	[[ -z ${P[source_sr]} ]] || fail "$code" "Project '$code' is already a Send/Receive project ('${P[source_sr]}')."
}

# --------------------------------------------------------------------------- #
# preflight
# --------------------------------------------------------------------------- #

# preflight CODE... -- check every project before any is migrated, and stop if any would fail.
# A project is checked against what it should be for this script; see preflight_classification
# in the calling script. Projects nobody has started on also get a --dry-run of the migration,
# which catches what the migration itself would refuse.
preflight() {
	heading "Checking ${#} project(s) before migrating any"
	local code problems=() before log
	for code in "$@"; do
		before=${#problems[@]}
		# A failure here is nearly always the same for every project (container down, LexBox login
		# refused), so stop at the first rather than repeat it for each.
		probe "$code" lexbox,custom-fields ||
			die "could not inspect $code (the error is above). Is the app container running, and can it reach LexBox?"
		[[ ${P[source_exists]} == 1 ]] || {
			problems+=("$code: no such project in Mongo")
			continue
		}
		[[ ${P[source_id]} == "${LIST_ID[$code]}" ]] ||
			problems+=("$code: _id is ${P[source_id]}, but the list says ${LIST_ID[$code]}")
		[[ -z ${P[source_sr]} ]] || problems+=("$code: already a Send/Receive project ('${P[source_sr]}')")
		((${P[custom_field_case_problems]} == 0)) ||
			problems+=("$code: has custom field names differing only by case that the migration does not know how to rename")
		((${P[custom_fields_dropped_with_data]} == 0)) ||
			problems+=("$code: has ${P[custom_fields_dropped_with_data]} custom field(s) holding data that the migration would leave out (type undetermined)")

		local classification
		classification=$(preflight_classification "$code")
		[[ -z $classification ]] || problems+=("$code: $classification")

		if lexbox_project_in_the_way "$code"; then
			problems+=("$code: LexBox already has a project '${P[lexbox_code]}', and nothing in $LOG_DIR shows this script creating it (a leftover test?)")
		fi

		if ! leftovers_exist && ((${#problems[@]} == before)); then
			log=$(new_log "$code" dry-run)
			if ! app_python "$MIGRATION_SCRIPT" "$code" --dry-run "${FORWARD[@]}" </dev/null >"$log" 2>&1; then
				problems+=("$code: the migration's --dry-run failed; see $log")
			fi
		fi

		if ((${#problems[@]} == before)); then
			say "  ok   $code  (${P[source_entries]} entries, ${P[source_comments]} comments, ${P[custom_field_definitions]} custom field definition(s))"
		else
			say "  FAIL $code"
		fi
	done

	if ((${#problems[@]})); then
		printf '\n%s: nothing was migrated, because of these problems:\n' "$SCRIPT_NAME" >&2
		printf '  - %s\n' "${problems[@]}" >&2
		exit 1
	fi
}

print_summary() {
	heading "Summary"
	say "Migrated and verified in this run: $MIGRATED"
	if ((${#WARNINGS[@]})); then
		say "Warnings:"
		printf '  - %s\n' "${WARNINGS[@]}"
	fi
}
