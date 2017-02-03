#!/bin/bash

backupXForgeServer.sh

echo "Cleaning up files older than 2 weeks..."
find /backup/*.tgz -mtime +14 -exec rm {} \;

echo "Rsyncing to backups.palaso.org..."
rsync -vazHAX --delete-during /backup/*.tgz backup@backup.palaso.org:/backup/svr01-vm106/xForge
