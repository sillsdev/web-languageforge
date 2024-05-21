#!/bin/bash

# ===== EDIT THIS if your Kubernetes context names are different =====

staging_context="dallas-rke"
prod_context="aws-rke"

# Uncomment one of the two blocks below to choose between staging and prod

echo "Using staging context..." >&2
context="${staging_context}"

# echo "Using prod context..." >&2
# context="${prod_context}"

# ===== END of "EDIT THIS" block =====

echo "Checking for necessary tools..." >&2
which jq >/dev/null
if [ $? -ne 0 ]; then
    echo "jq (JSON Query) not found. This script needs it to run." >&2
    echo "Try \"apt install jq\" on Linux, \"brew install jq\" on Mac, or \"choco install jq\" or \"winget install jqlang.jq\" on Windows." >&2
    exit 1
fi

proj=$1

# Create a temp dir reliably on both Linux and OS X
workdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'sfbackup')

function cleanup {
    echo "Cleaning up temporary directory ${workdir}..." >&2
    # Commented out for now since we want to be able to examine the results
    # [ -n "${workdir}" ] && [ -d "${workdir}" ] && rm -rf "${workdir}"
}

[ -n "${workdir}" ] && [ -d "${workdir}" ] && trap cleanup EXIT

echo "Looking up Mongo ID of local admin user..." >&2
admin_id=$(docker exec lf-db mongosh -u admin -p pass --authenticationDatabase admin scriptureforge --eval "db.users.findOne({username: 'admin'}, {_id: 1})" | cut -d"'" -f 2)

if [ -z "${admin_id}" ]; then
    echo "Could not find local admin ID. Please try running 'docker exec -it lf-db mongosh' and see what happens." >&2
    exit 1
fi

echo "Verifying admin ID..." >&2
docker exec lf-db mongosh -u admin -p pass --authenticationDatabase admin scriptureforge --eval "db.users.findOne({_id: ObjectId('${admin_id}')}, {name: 1, username: 1, email: 1})"
echo "If that looks wrong, hit Ctrl+C NOW" >&2
sleep 1

echo "Backing up project with ID ${proj}..." >&2
echo "Getting project code..." >&2

projCode=$(kubectl --context="${context}" exec deploy/db -- mongosh --quiet scriptureforge --eval 'db.projects.findOne({_id: ObjectId('"'${proj}'"')}, {projectCode: 1})' | grep projectCode | cut -d"'" -f 2)
echo "Project code: $projCode" >&2

echo "If that looks wrong, hit Ctrl+C NOW" >&2
sleep 1

echo "Getting project record..." >&2

kubectl --context="${context}" exec deploy/db -- mongosh --quiet scriptureforge --eval 'db.projects.findOne({_id: ObjectId('"'${proj}'"')})' --json=canonical > "${workdir}/project.json"

echo "Removing users and replacing project manager with admin..." >&2
jq "setpath([\"users\"]; {\"${admin_id}\": {\"role\": \"project_manager\"}}) | setpath([\"ownerRef\"]; {\"\$oid\": \"${admin_id}\"} )" < "${workdir}/project.json" > "${workdir}/project-modified.json"

echo "Getting project database..." >&2
dbname="sf_${projCode}"

kubectl --context="${context}" exec deploy/db -- mongodump -d "${dbname}" --archive > "${workdir}/db.archive"
# Once we require auth, this will become:
# kubectl --context="${context}" exec deploy/db -- mongodump -u admin -p pass --authenticationDatabase admin -d "${dbname}" --archive > "${workdir}/db.archive"
docker exec -i lf-db mongorestore -u admin -p pass --authenticationDatabase admin -d "${dbname}" --drop --archive < "${workdir}"/db.archive

echo "Loaded project database ${dbname} successfully. Probably. You should check mongosh to be sure." >&2

echo "Importing project record into local projects collection..." >&2
docker exec -i lf-db mongoimport -u admin -p pass --authenticationDatabase admin -d scriptureforge -c projects --mode=upsert < "${workdir}/project-modified.json"

echo "Okay, ${projCode} should be available in your Language Forge installation now." >&2

echo "Fetching assets (might fail or only partially transfer)..." >&2
echo "NOTE: This may take a long time without feedback, and might fail without warning if the kubectl connection gets dropped partway through..." >&2
mkdir -p "${workdir}/assets/${dbname}"
kubectl --context="${context}" exec deploy/app -- tar chf - -C "/var/www/html/assets/lexicon/${dbname}" . | tar xf - -i -C "${workdir}/assets/${dbname}"

echo "Verifying assets (if you see tar errors above, then it might only be a partial transfer)..." >&2
ls -lR "${workdir}/assets"

# The /. at the end of the src tells Docker "just copy the *contents* of the directory, don't copy the directory itself"
docker cp "${assetSrc}/." "lf-app:/var/www/html/assets/lexicon/${dbname}"
