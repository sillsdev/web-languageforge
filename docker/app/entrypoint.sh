#!/bin/sh

if [ "x$ENVIRONMENT" = "xdevelopment" ]; then
    /wait
    RETCODE=$?
    if [ "$RETCODE" -gt 0 ]; then
        exit $RETCODE
    fi
fi

# rsyslog needs to run so that lfmerge can log to /var/log/syslog
/etc/init.d/rsyslog start

# run lfmergeqm on startup to clear out any failed send/receive sessions from previous container
if [ which /lfmergeqm-background.sh ]; then
    # MUST be run as a background process as it kicks off an infinite loop to run every 24 hours
    /lfmergeqm-background.sh &
fi

# Now chain to Docker entrypoint from base php:apache image
exec docker-php-entrypoint "$@"
