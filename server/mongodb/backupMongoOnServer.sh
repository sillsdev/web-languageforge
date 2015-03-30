#!/bin/bash

TODAY=$(date +"%Y-%m-%d")
BACKUPFILE="mongodb_backup_$TODAY.tgz"
MONGOOUTPUTDIR=mongo_backup

mongodump -o $MONGOOUTPUTDIR
tar -czvf $BACKUPFILE $MONGOOUTPUTDIR
rm -r $MONGOOUTPUTDIR
echo "Mongo backup is in $BACKUPFILE"