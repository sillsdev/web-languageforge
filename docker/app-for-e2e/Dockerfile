FROM lf-app:latest

COPY src/config.php /var/www/src/config.php

COPY docker/app-for-e2e/run.sh /run.sh

COPY test/app /var/www/test/app
COPY test/common /var/www/test/common
COPY test/php /var/www/test/php

WORKDIR /var/www/test/app

CMD ["/run.sh"]
