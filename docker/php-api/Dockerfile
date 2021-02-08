FROM php:7.3-apache

# install Language Forge APT dependencies
# insalling git to avoid composer error "Cloning failed using an ssh key for authentication, enter your GitHub credentials to access private repos"
RUN apt-get update && apt-get -y install p7zip-full unzip git

# see https://github.com/mlocati/docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd xdebug mongodb intl @composer

COPY src/composer.json src/composer.lock /var/www/html/
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

COPY docker/php-api/php.ini /usr/local/etc/php

RUN a2enmod headers rewrite
COPY docker/php-api/000-default.conf /etc/apache2/sites-enabled
COPY docker/php-api/apache2.service /etc/systemd/system
