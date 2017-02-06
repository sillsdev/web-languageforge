#!/bin/bash

backupXForgeServer.sh

# from https://archive-rotator.readthedocs.io/en/latest/
archive-rotator --tiered -n 6 -n 4 -n 6 /backup/lf_assets_backup.tgz
archive-rotator --tiered -n 6 -n 4 -n 6 /backup/sf_assets_backup.tgz
archive-rotator --tiered -n 6 -n 4 -n 6 /backup/mongodb_backup.tgz

echo "Rsyncing to backups.palaso.org..."
rsync -vazHAX --delete-during /backup/*.tgz.* backup@backup.palaso.org:/backup/svr01-vm106/xForge
