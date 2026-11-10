#!/usr/bin/env bash
# shellcheck disable=SC2004  # ${P[...]} inside (( )) on purpose: under set -u a missing key is
#                               an error, where a bare P[...] would quietly read as 0.
# Migrate a list of projects that HAVE custom fields into Send/Receive, in two stages.
#
#     scripts/migrate_custom_field_projects.sh projectsWorthMigrating-custom-fields.txt
#     scripts/migrate_custom_field_projects.sh - < list.txt
#     scripts/migrate_custom_field_projects.sh list.txt -- --lexbox-host https://lexbox.org
#
# LfMerge cannot create custom fields, so copy_project_for_migration.py stops each of these
# projects short of Send/Receive and writes the FLExProject.CustomProperties file a human has to
# commit to the project's LexBox repository first. This script runs that over the whole list:
#
# FIRST RUN -- stage 1
#   Each project is copied and its LexBox project created (the migration run without options,
#   which stops for custom fields). Its CustomProperties file is copied out of the container into
#   ./custom-fields/, and the copy is checked against the list: the listed entry and comment
#   counts (or the source's current counts, with a warning, if it has changed since), as many
#   entries with custom field data as the source, no Send/Receive yet, and one definition in the
#   file for every custom field the migration found. Then "<code><TAB>stage1" goes into
#   ./customFieldsMigrationProgress.txt.
#
#   With stage 1 done for every project, the script prints, grouped together at the end, the hg
#   commands that commit each project's file into a clone under ./custom-fields-repos/, and stops
#   (exit status 3).
#
# SECOND RUN -- stage 2
#   For every project, the clone at ./custom-fields-repos/<LexBox code> must exist, come from that
#   project's LexBox repository, and have FLExProject.CustomProperties committed (on the same branch
#   as revision 0), with no uncommitted changes, with every custom field the generated file defines,
#   and with no FILL-IN-LIST-ROOT-GUID placeholder left in it. A committed file is taken to be pushed:
#   hg outgoing would need the LexBox credentials. If any project fails, nothing goes on to stage 2;
#   the script lists what is wrong, prints the hg commands again for those projects, and exits 3.
#
#   Otherwise each project is finished with `--resume` (both Send/Receives) and verified as
#   migrate_non_custom_field_projects.sh verifies a finished project -- including that the copy
#   still has as many entries with custom field data as the source, which is what would show that
#   LfMerge skipped the custom fields. Then "<code><TAB>stage2" goes into the progress log.
#
# RESUMING
#   As in migrate_non_custom_field_projects.sh: the first problem stops the run, and the next run
#   skips what the progress log records and picks the interrupted project up from the state it is
#   really in. A stage 1 that was cut off is started again; a project whose copy has somehow been
#   through Send/Receive before stage 2 is stopped for a human, because its custom field data may
#   not have reached LexBox.
#
# Before either stage, every project still to do is checked, as in the other script, except that
# each one must have custom fields. See migration_batch_common.sh for the environment variables.
#
# Needs hg on the PATH of the machine this runs on, for the stage 2 check.

set -euo pipefail

SCRIPT_NAME=$(basename -- "$0")
PROGRESS_FILE=customFieldsMigrationProgress.txt
MODE=custom
# shellcheck source=migration_batch_common.sh
source "$(dirname -- "${BASH_SOURCE[0]}")/migration_batch_common.sh"

CF_DIR="$WORK_DIR/custom-fields"
CLONES_DIR="$WORK_DIR/custom-fields-repos"
CUSTOM_PROPERTIES=FLExProject.CustomProperties
PLACEHOLDER=FILL-IN-LIST-ROOT-GUID
EXIT_WAITING_FOR_COMMITS=3

declare -A COMMIT_STATE=() COMMIT_NOTES=()

usage_details() {
	cat <<EOF

Every project in the list must have custom fields. The first run does stage 1 for all of them and
prints the hg commands to commit each one's $CUSTOM_PROPERTIES (clones go in
./custom-fields-repos/). The next run checks the commits and does stage 2.

Exit status: 0 when every project is migrated; 3 when waiting for custom field commits; 1 on error.
EOF
}

cf_file() {
	printf '%s/%s.%s' "$CF_DIR" "${NEW_CODE[$1]}" "$CUSTOM_PROPERTIES"
}

# Called by preflight with P filled in; prints a problem, or nothing.
preflight_classification() {
	local code=$1
	if progress_has "$code" stage1; then
		if [[ ${P[copy_exists]} != 1 ]]; then
			printf 'stage 1 is recorded as done, but the copy %s does not exist' "${P[new_code]}"
		elif [[ ${P[lexbox_exists]} != 1 ]]; then
			printf "stage 1 is recorded as done, but LexBox has no project '%s'" "${P[lexbox_code]}"
		fi
	elif ((${P[custom_field_definitions]} == 0)); then
		printf 'has no custom field definitions; migrate it with migrate_non_custom_field_projects.sh'
	fi
}

# --------------------------------------------------------------------------- #
# stage 1
# --------------------------------------------------------------------------- #

migrate_stage1() {
	local code=$1 log reason path dest
	VERIFIED_STAGE=stage1

	probe_or_fail "$code" lexbox
	check_source "$code"
	reason=$(busy_reason)
	[[ -z $reason ]] || fail "$code" "Not touching it: $reason." "Wait for it to finish, then run this script again."
	if copy_synced || ((${P[assets_links]} > 0)); then
		fail "$code" "The copy ${P[new_code]} has already been through a Send/Receive, before stage 1 was recorded." \
			"LfMerge skips custom fields that are not yet defined in FieldWorks, so their data may not have" \
			"reached LexBox. Check the LexBox project '${P[lexbox_code]}' by hand before doing anything else."
	fi
	set_restart_flags "$code"

	log=$(new_log "$code" stage1)
	run_migration "$code" "$log" "${RESTART_FLAGS[@]}" || fail "$code" "Stage 1 failed; see $log"

	if grep -q '^Paused for custom fields' "$log"; then
		path=$(sed -n 's/^Written to: //p' "$log" | tail -n 1)
		[[ -n $path ]] || fail "$code" "The migration paused but did not say where it wrote $CUSTOM_PROPERTIES; see $log"
		mkdir -p -- "$CF_DIR"
		dest=$(cf_file "$code")
		app_exec cat -- "$path" </dev/null >"$dest.part" ||
			fail "$code" "Could not copy $path out of the app container."
		mv -- "$dest.part" "$dest"
		say "  custom field definitions saved to $dest"
		verify_stage1 "$code"
		progress_add "$code" stage1
	elif grep -q '^Done\. ' "$log"; then
		# Its custom fields have gone since the check before stage 1, so the migration went all
		# the way. Nothing is waiting on a commit; treat it as a finished migration.
		warn "$code: needed no custom field definitions after all, so stage 1 migrated it completely"
		VERIFIED_STAGE=stage2
		verify_finished "$code"
		progress_add "$code" stage1
		progress_add "$code" stage2
		((MIGRATED += 1))
	else
		fail "$code" "Stage 1 exited without pausing for custom fields or finishing; see $log"
	fi
}

verify_stage1() {
	local code=$1 file written
	PROBLEMS=()
	probe_or_fail "$code" custom-fields
	check_copy "$code"
	! copy_synced || PROBLEMS+=("the copy has already been through a Send/Receive")
	file=$(cf_file "$code")
	written=$(grep -c '^[[:space:]]*<CustomField' "$file" || true)
	[[ $written == "${P[custom_field_definitions]}" ]] ||
		PROBLEMS+=("$file defines $written custom field(s), but the migration found ${P[custom_field_definitions]}")
	report_verification "$code"
}

# --------------------------------------------------------------------------- #
# between the stages: has each project's CustomProperties been committed?
# --------------------------------------------------------------------------- #

# check_commit CODE -- set COMMIT_STATE[CODE] to ok, waiting or problem, and COMMIT_NOTES[CODE].
check_commit() {
	local code=$1 lexbox=${LEXBOX_CODE[$1]} file repo
	file=$(cf_file "$code")
	repo="$CLONES_DIR/$lexbox"
	local notes=() problems=()
	hgq() { HGPLAIN=1 hg --cwd "$repo" "$@"; }

	if [[ ! -s $file ]]; then
		COMMIT_STATE[$code]=problem
		COMMIT_NOTES[$code]="the generated file $file is missing. To make it again, delete the line '$code<TAB>stage1' from $PROGRESS_FILE and run this script again"
		return
	fi
	if [[ ! -d $repo/.hg ]]; then
		COMMIT_STATE[$code]=waiting
		COMMIT_NOTES[$code]="not cloned yet"
		return
	fi

	local default
	default=$(hgq paths default 2>/dev/null || true)
	default=${default%/}
	if [[ $default != */hg/"$lexbox" ]]; then
		COMMIT_STATE[$code]=problem
		COMMIT_NOTES[$code]="the clone at $repo comes from '${default:-nowhere}', not from LexBox project $lexbox"
		return
	fi

	local changes rev
	changes=$(hgq status -- "$CUSTOM_PROPERTIES" | tr '\n' ' ')
	changes=${changes% }
	rev=$(hgq log -r "last(file('path:$CUSTOM_PROPERTIES') and not 0)" -T '{node|short}' 2>/dev/null || true)
	if [[ -z $rev ]]; then
		COMMIT_STATE[$code]=waiting
		COMMIT_NOTES[$code]="cloned, but $CUSTOM_PROPERTIES has not been committed${changes:+ (hg status: $changes)}"
		return
	fi
	[[ -z $changes ]] || problems+=("$CUSTOM_PROPERTIES has uncommitted changes (hg status: $changes)")

	local committed key missing=()
	committed=$(hgq cat -r "$rev" -- "$CUSTOM_PROPERTIES")
	while IFS= read -r key; do
		grep -qF -- "$key" <<<"$committed" || missing+=("$key")
	done < <(grep -o 'key="[^"]*"' "$file")
	((${#missing[@]} == 0)) ||
		problems+=("the committed file (changeset $rev) lacks ${#missing[@]} field(s) the generated one defines: ${missing[*]}")
	! grep -qF "$PLACEHOLDER" <<<"$committed" ||
		problems+=("the committed file still contains $PLACEHOLDER; a listRoot has to be filled in")

	local branch branch0
	branch=$(hgq log -r "$rev" -T '{branch}')
	branch0=$(hgq log -r 0 -T '{branch}')
	[[ $branch == "$branch0" ]] ||
		problems+=("changeset $rev is on branch '$branch', but the project's history is on '$branch0'")

	if ((${#problems[@]})); then
		COMMIT_STATE[$code]=problem
		COMMIT_NOTES[$code]=$(join_notes "${problems[@]}")
		return
	fi

	notes+=("committed in changeset $rev")
	if cmp -s <(hgq cat -r "$rev" -- "$CUSTOM_PROPERTIES") "$file"; then
		notes+=("identical to the generated file")
	else
		notes+=("edited from the generated file, but defines all its fields")
	fi
	[[ $(hgq log -r "$rev" -T '{phase}') != draft ]] ||
		notes+=("still in draft phase, so make sure it has been pushed")
	COMMIT_STATE[$code]=ok
	COMMIT_NOTES[$code]=$(join_notes "${notes[@]}")
}

join_notes() {
	local joined
	printf -v joined '%s; ' "$@"
	printf '%s' "${joined%; }"
}

print_commit_block() {
	local code=$1 lexbox=${LEXBOX_CODE[$1]} file repo reviews
	file=$(cf_file "$code")
	repo="$CLONES_DIR/$lexbox"
	printf '\n----- %s  (LexBox project %s) -----\n' "$code" "$lexbox"
	printf '# %s\n' "${COMMIT_NOTES[$code]}"
	[[ -s $file ]] || return 0

	[[ -d $repo/.hg ]] || printf 'hg clone %q %q\n' "${HG_URL[$code]}" "$repo"
	printf 'cp %q %q\n' "$file" "$repo/$CUSTOM_PROPERTIES"
	if grep -qF "$PLACEHOLDER" "$file"; then
		printf '# EDIT FIRST: replace %s in %s with the GUID of the list it names\n' "$PLACEHOLDER" "$repo/$CUSTOM_PROPERTIES"
		printf '# (the REVIEW comment above it says which); that list has to exist in the project.\n'
	fi
	reviews=$(grep -c 'REVIEW:' "$file" || true)
	((reviews == 0)) || printf '# Check the %s REVIEW comment(s) in the file before committing.\n' "$reviews"
	printf "hg --cwd %q commit -A -m 'Add custom fields' %s\n" "$repo" "$CUSTOM_PROPERTIES"
	printf 'hg --cwd %q push\n' "$repo"
}

# Check every project waiting for stage 2; if any is not ready, print the hg commands for those,
# grouped at the end, and stop.
require_commits() {
	local code not_ready=()
	heading "Custom field commits (clones in $CLONES_DIR)"
	for code in "$@"; do
		check_commit "$code"
		printf '  %-8s %s: %s\n' "${COMMIT_STATE[$code]}" "$code" "${COMMIT_NOTES[$code]}"
		[[ ${COMMIT_STATE[$code]} == ok ]] || not_ready+=("$code")
	done
	((${#not_ready[@]})) || return 0

	heading "Commit the custom fields for ${#not_ready[@]} project(s)"
	say "Run these from any directory. The second Send/Receive cannot start until every project in the"
	say "list is ready, because the migration's first Send/Receive is the only one that carries the"
	say "custom field data. A commit is taken to have been pushed; this script cannot check that."
	for code in "${not_ready[@]}"; do
		print_commit_block "$code"
	done
	printf '\nThen run this script again with the same list (and the same options) to start stage 2.\n'
	exit "$EXIT_WAITING_FOR_COMMITS"
}

# --------------------------------------------------------------------------- #

main() {
	init "$@"
	command -v hg >/dev/null || die "hg is not on the PATH; it is needed to check the custom field commits"

	local code pending=() stage1=() stage2=()
	for code in "${CODES[@]}"; do
		progress_has "$code" stage2 || pending+=("$code")
	done
	say "$((${#CODES[@]} - ${#pending[@]})) of ${#CODES[@]} project(s) already migrated (in $PROGRESS_FILE)."
	if ((${#pending[@]} == 0)); then
		say "Nothing to do."
		return 0
	fi

	preflight "${pending[@]}"

	for code in "${pending[@]}"; do
		progress_has "$code" stage1 || stage1+=("$code")
	done
	if ((${#stage1[@]})); then
		heading "Stage 1: ${#stage1[@]} project(s)"
		local index=0
		for code in "${stage1[@]}"; do
			((index += 1))
			heading "[stage 1, $index/${#stage1[@]}] $code"
			migrate_stage1 "$code"
		done
	fi

	# Stage 1 may have finished a project outright; see migrate_stage1.
	for code in "${pending[@]}"; do
		progress_has "$code" stage2 || stage2+=("$code")
	done
	if ((${#stage2[@]})); then
		require_commits "${stage2[@]}"

		heading "Stage 2: ${#stage2[@]} project(s)"
		local index=0
		for code in "${stage2[@]}"; do
			((index += 1))
			heading "[stage 2, $index/${#stage2[@]}] $code"
			migrate_to_finish "$code" stage2
		done
	fi

	print_summary
}

main "$@"
