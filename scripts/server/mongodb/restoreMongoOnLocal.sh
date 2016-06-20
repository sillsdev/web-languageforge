#!/bin/bash
ARCHIVEFILE=$1

if [ -f $ARCHIVEFILE ]; then
	tar -xvzf $ARCHIVEFILE
	mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){  if (i.indexOf("sf_") == 0 || i.indexOf("scriptureforge") == 0) { print("Dropping " + i); db.getSiblingDB(i).dropDatabase()}})'
	mongorestore mongo_backup

	# clean up
	if [ -d "mongo_backup" ]; then
		echo Removing $BACKUPNAME
		rm -r mongo_backup
	fi


fi
