#!/bin/sh

# rsyslog needs to run so that lfmerge can log to /var/log/syslog
/etc/init.d/rsyslog start

# run lfmergeqm on startup to clear out any failed send/receive sessions from previous container
/lfmergeqm-background.sh & # MUST be run as a background process as it kicks off an infinite loop to run every 24 hours

# Now chain to Docker entrypoint from base php:apache image
exec docker-php-entrypoint "$@"
