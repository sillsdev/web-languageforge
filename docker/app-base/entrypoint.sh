#!/bin/sh

# rsyslog needs to run so that lfmerge can log to /var/log/syslog
/etc/init.d/rsyslog start

# run lfmergeqm on startup to clear out any failed send/receive sessions from previous container
which lfmergeqm && su www-data -s /bin/bash -c lfmergeqm

# Now chain to Docker entrypoint from base php:apache image
exec docker-php-entrypoint "$@"
