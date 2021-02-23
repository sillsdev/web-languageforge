FROM php:7.3-apache

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip git

# see https://github.com/mlocati/docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd xdebug mongodb intl @composer

# php.ini customizations
COPY docker/api/php.ini /usr/local/etc/php

# apache2 module and virtual host customizations
RUN a2enmod headers rewrite
COPY docker/api/000-default.conf /etc/apache2/sites-enabled
COPY docker/api/apache2.service /etc/systemd/system

# copy src files into our image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# run composer install
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

# Add docker-compose-wait tool -------------------
# see https://www.datanovia.com/en/courses/docker-compose-wait-for-dependencies/
# Note:
# this container depends upon running/functioning mail and db containers.  These take
# time to initialize, and scripts such as running tests or db-reset might fail if the
# db or mail service are not fully up yet.  We can use docker-compose-wait in downstream
# containers to wait for these services to be started
ENV WAIT_VERSION=2.7.2 \
    WAIT_HOSTS=db:27017,mail:25 \
    WAIT_HOSTS_TIMEOUT=300 \
    WAIT_SLEEP_INTERVAL=2 \
    WAIT_HOST_CONNECT_TIMEOUT=30
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/$WAIT_VERSION/wait /wait
RUN chmod +x /wait
