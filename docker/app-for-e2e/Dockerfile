FROM lf-app:latest

COPY src/config.php.fortest /var/www/src/config.php
COPY docker/app-for-e2e/run.sh /run.sh
COPY test /var/www/test/
WORKDIR /var/www/test/app
CMD ["/run.sh"]
