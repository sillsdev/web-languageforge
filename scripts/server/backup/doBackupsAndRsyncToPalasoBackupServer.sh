#!/bin/bash

backupXForgeServer.sh

echo "Rsyncing to backups.palaso.org..."
rsync -vazHAX --delete-during /backup/*.tgz backup@backup.palaso.org:/backup/svr01-vm106/xForge

echo "Rotating Backups on backups.palaso.org"
ssh backup@backup.palaso.org 'archive-rotator --tiered -n 6 -n 4 -n 6 /backup/svr01-vm106/xForge/mongodb_backup.tgz'
ssh backup@backup.palaso.org 'archive-rotator --tiered -n 6 -n 4 -n 6 /backup/svr01-vm106/xForge/sf_assets_backup.tgz'
ssh backup@backup.palaso.org 'archive-rotator --tiered -n 6 -n 4 -n 6 /backup/svr01-vm106/xForge/lf_assets_backup.tgz'
