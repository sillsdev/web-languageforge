#!/bin/bash
# Read the non-Send/Receive project list and print each project's code and Mongo ObjectId.
#
# nonSRProjects.txt is tab-separated, one project per line, largest first:
#     <projectCode>  <lexiconEntryCount>  <lexiconCommentsCount>  <mongoObjectId>
set -euo pipefail

# Resolve the list next to this script, so it can be run from any directory.
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
project_list="${1:-$script_dir/projectsWorthMigrating.txt}"

KUBE_CONTEXT="lf-prod"

MONGODB_PASS=$(kubectl --context=$KUBE_CONTEXT get secret/mongo-auth -o json | jq -r .data.MONGODB_PASS | base64 -d)
MONGODB_USER="admin"

echo "Starting migration of $(wc -l $project_list) projects, largest ones first..."
echo ""

# IFS is set per-read so only tabs split the fields: a project name or code could in
# principle contain a space, and the default IFS would break it apart.
# The `|| [[ -n "$project_code" ]]` keeps the last line if the file has no trailing newline.
#
# entry_count and comment_count are read into their own variables but not used yet; they are what
# the list is sorted by and what says whether a project has comments to convert, so a real
# migration loop here will want them.
# shellcheck disable=SC2034

# Old:
#while IFS=$'\t' read -u 5 -r project_code entry_count comment_count project_id || [[ -n "$project_code" ]]; do

# New:

while IFS=$'\t' read -u 5 -r project_code entry_count comment_count project_id edit_category human_readable_explanation || [[ -n "$project_code" ]]; do
	# Skip blank lines and comments, so the list can be annotated later.
	[[ -z "$project_code" || "$project_code" == \#* ]] && continue

    echo "About to fetch $project_code ($project_id) from production..."
    echo ""
    # backup.mjs uses MONGO_USER and MONGO_PASS, which is why they were set earlier
    time MONGO_USER=$MONGODB_USER MONGO_PASS=$MONGODB_PASS node backup.mjs "$project_id" prod
    echo "Done with exit code $?"
	echo "$project_code should have $entry_count entries and $comment_count comments; does that look right?"
    echo ""
    time docker compose exec -T app python3 /var/www/scripts/copy_project_for_migration.py "$project_code" --lexbox-host http://admin.localhost
    echo "Done with exit code $?"
done 5< "$project_list"
