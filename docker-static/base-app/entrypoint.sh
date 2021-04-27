#!/bin/sh

# rsyslog needs to run so that lfmerge can log to /var/log/syslog
/etc/init.d/rsyslog start

# Now chain to Docker entrypoint from base php:apache image
exec docker-php-entrypoint "$@"
