FROM php:7.3.28-apache

# install apt packages
# p7zip-full - used by LF application for unzipping lexicon uploads
# unzip - used by LF application for unzipping lexicon uploads
# curl - used by LF application
RUN apt-get update && apt-get -y install p7zip-full unzip curl tini && rm -rf /var/lib/apt/lists/*

# see https://github.com/mlocati/docker-php-extension-installer
# PHP extensions required by the LF application
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd mongodb intl

# php customizations
COPY docker/base-php/customizations.php.ini $PHP_INI_DIR/conf.d/

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/base-php/000-default.conf /etc/apache2/sites-enabled
