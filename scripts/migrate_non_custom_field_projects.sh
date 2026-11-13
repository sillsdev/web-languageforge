#!/usr/bin/env bash
# Migrate a list of projects that have NO custom fields into Send/Receive, one at a time.
#
#     scripts/migrate_non_custom_field_projects.sh projectsWorthMigrating-no-custom-fields.txt
#     scripts/migrate_non_custom_field_projects.sh - < list.txt
#     scripts/migrate_non_custom_field_projects.sh list.txt -- --lexbox-host https://lexbox.org
#
# For each project in the list, copy_project_for_migration.py makes the "-migrate" copy and takes it
# all the way through both Send/Receives. Each one is then checked against the list: the source
# must have the listed Mongo _id, and the copy must have the listed numbers of entries and comments
# (or, if the source has changed since the list was made, the source's current numbers, with a
# warning), as many entries with custom field data as the source, a completed Send/Receive and its
# assets linked into the Send/Receive work tree. Only then is the project code added to
# ./nonCustomFieldsMigrationProgress.txt.
#
# Before migrating anything, every project is checked, and nothing is migrated if any check fails:
# the source exists with the listed _id and is not already a Send/Receive project, it has no custom
# fields (those belong to migrate_custom_field_projects.sh), no leftover LexBox project is in the
# way, and the migration's own --dry-run succeeds.
#
# RESUMING
#   The first problem stops the run. Running it again skips every project in the progress log and
#   picks up the one that stopped from whatever state it is really in, not from what the log says:
#     - nothing created, or the first Send/Receive never completed: start that project again,
#       keeping its LexBox project if this script created it (--force --no-init);
#     - the first Send/Receive completed: just move the assets and run the second one;
#     - everything ran but was never verified: verify it.
#   A project whose migration or Send/Receive is still running is left alone, with a message.
#
# See migration_batch_common.sh for the environment variables and the files this writes.

set -euo pipefail

SCRIPT_NAME=$(basename -- "$0")
PROGRESS_FILE=nonCustomFieldsMigrationProgress.txt
MODE=non-custom
# shellcheck source=migration_batch_common.sh
source "$(dirname -- "${BASH_SOURCE[0]}")/migration_batch_common.sh"

usage_details() {
	cat <<EOF

Every project in the list must be free of custom fields; the check before migrating stops the
run if one is not. Exit status: 0 when every project is migrated, 1 otherwise.
EOF
}

# Called by preflight with P filled in; prints a problem, or nothing.
preflight_classification() {
	local count=${P[custom_field_definitions]}
	if ((count > 0)); then
		printf 'has %s custom field definition(s); migrate it with migrate_custom_field_projects.sh' "$count"
	fi
}

main() {
	init "$@"

	local code pending=()
	for code in "${CODES[@]}"; do
		progress_has "$code" || pending+=("$code")
	done
	say "$((${#CODES[@]} - ${#pending[@]})) of ${#CODES[@]} project(s) already migrated (in $PROGRESS_FILE)."
	if ((${#pending[@]} == 0)); then
		say "Nothing to do."
		return 0
	fi

	preflight "${pending[@]}"

	local index=0
	for code in "${pending[@]}"; do
		((index += 1))
		heading "[$index/${#pending[@]}] $code"
		migrate_to_finish "$code" whole
	done

	print_summary
}

main "$@"
