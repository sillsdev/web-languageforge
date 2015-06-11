#!/bin/bash

TODAY=$(date +"%Y-%m-%d")
BACKUPFILE="mongodb_backup_$TODAY.tgz"

rm $BACKUPFILE
