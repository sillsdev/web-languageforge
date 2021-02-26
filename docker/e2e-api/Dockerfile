FROM lf-api:latest

COPY test /var/www/test/
COPY src/config.php.fortest /var/www/src/config.php

COPY docker/e2e-api/run.sh /run.sh

WORKDIR /var/www/test/app
CMD ["/run.sh"]
