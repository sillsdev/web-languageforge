#!/bin/bash

set -e
set -x

PRODCONTEXT=--context='languageforge'
QACONTEXT=--context='qa-languageforge'
PRODSERVER=$(kubectl $PRODCONTEXT get pods --selector='app=db' -o name | sed -e s'/pod\///')
QASERVER=$(kubectl $QACONTEXT get pods --selector='app=db' -o name | sed -e s'/pod\///')

echo "Mongo Dump on production"
kubectl $PRODCONTEXT exec -c db $PRODSERVER -- bash -c "cd /data/db && mongodump"

echo "Create tar file of dump"
kubectl $PRODCONTEXT exec -c db $PRODSERVER -- bash -c "cd /data/db && tar -czvf mongodump.tgz dump"

echo "Copy tgz file to local filesystem"
kubectl $PRODCONTEXT cp -c db $PRODSERVER:/data/db/mongodump.tgz .

echo "See how big mongo dump file is"
ls -lh mongodump.tgz

echo "Copy tgz file to QA"
kubectl $QACONTEXT cp -c db mongodump.tgz $QASERVER:/data/db

echo "Untar mongodump.tgz on QA"
kubectl $QACONTEXT exec -c db $QASERVER -- bash -c "cd /data/db && tar -xvzf mongodump.tgz"

#echo "Drop and load prod data on QA"
#kubectl $QACONTEXT exec -c db $QASERVER -- bash -c "cd /data/db && mongorestore --drop dump"

#echo "Clean up on PROD"
#kubectl $PRODCONTEXT exec -c db $PRODSERVER -- bash -c "rm -r /data/db/dump && rm /data/db/mongodump.tgz"

#echo "Clean up on QA"
#kubectl $QACONTEXT exec -c db $QASERVER -- bash -c "rm -r /data/db/dump && rm /data/db/mongodump.tgz"

#echo "Clean up local tarball"
#rm mongodump.tgz
