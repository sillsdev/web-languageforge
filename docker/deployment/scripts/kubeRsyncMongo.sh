#!/bin/bash

echo Mongo Dump
ssh mongo-xf mongodump

echo Remove Scripture Forge data from dump
ssh mongo-xf rm -r dump/xforge

echo Create tar file of dump
ssh mongo-xf tar -czvf mongodump.tgz dump

echo Copy tar file to local filesystem
scp mongo-xf:mongodump.tgz .

echo Clean up on remote
ssh mongo-xf rm -r dump
ssh mongo-xf rm mongodump.tgz

MONGOPOD=$(kubectl get pods --selector='app=db' -o name | sed -e s'/pod\///')

echo Copying mongodump.tgz into $MONGOPOD/data/db
kubectl cp -c db mongodump.tgz $MONGOPOD:/data/db

echo Untarring mongodump.tgz
kubectl exec -c db $MONGOPOD -- bash -c "cd /data/db \
    && tar -xvzf mongodump.tgz"

echo MongoRestore
kubectl exec -c db $MONGOPOD -- bash -c "cd /data/db \
    && mongorestore --drop dump"

echo Clean Up
kubectl exec -c db $MONGOPOD -- bash -c "rm -r /data/db/dump && rm /data/db/mongodump.tgz"
rm mongodump.tgz

echo Run Mongo migration
kubectl exec -c db $MONGOPOD -- bash -c 'mongo scriptureforge --eval "db.projects.updateMany({}, {"\$unset": {userProperties: 1}});"'
