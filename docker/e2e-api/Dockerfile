FROM lf-api:latest

COPY src/config.php.fortest /var/www/src/config.php
COPY docker/e2e-api/run.sh /run.sh
COPY test /var/www/test/
WORKDIR /var/www/test/app
CMD ["/run.sh"]
