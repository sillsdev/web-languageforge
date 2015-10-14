#!/bin/bash
TODAY=`date +%F`
SRCDIR=${1:-/var/www/host/sil}
BACKUPNAME=mongodb_backup_$TODAY
ARCHIVEFILE=$BACKUPNAME.tgz

if [ -f $SRCDIR/$ARCHIVEFILE ]; then
	cd ~
	cp $SRCDIR/$ARCHIVEFILE .
	tar -xvzf $ARCHIVEFILE
	mongo --quiet --eval 'db.getMongo().getDBNames().forEach(function(i){  if (i.indexOf("sf_") == 0 || i.indexOf("scriptureforge") == 0) { print("Dropping " + i); db.getSiblingDB(i).dropDatabase()}})'
	mongorestore mongo_backup

	# clean up
	rm $ARCHIVEFILE
	if [ -d "mongo_backup" ]; then
		echo Removing $BACKUPNAME
		rm -r mongo_backup
	fi
	

fi
