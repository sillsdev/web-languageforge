FROM php:7.3-apache

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip git gnupg2 curl

# see https://github.com/mlocati/docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd xdebug mongodb intl @composer

# php.ini customizations
COPY docker/api/php.ini /usr/local/etc/php

# apache2 module and virtual host customizations
RUN a2enmod headers rewrite
COPY docker/api/000-default.conf /etc/apache2/sites-enabled
COPY docker/api/apache2.service /etc/systemd/system

# install LFMerge
RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt-get update \
&& apt-get install --yes --no-install-recommends lfmerge

# setup LFMerge permissions
# TODO: we may not actually need to add www-data to the fieldworks group.  Needs testing
RUN adduser www-data fieldworks \
&& chown -R www-data:www-data /var/lib/languageforge \
&& chmod 0755 /var/lib/languageforge \
&& mkdir -m 02775 -p /var/www/.local \
&& chown www-data:www-data /var/www/.local

# run composer install
COPY src/composer.json src/composer.lock /var/www/html/
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

# make wait available for container ochestration
COPY --from=wait /wait /wait

# copy src files into our image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# ensure correct write permissions for assets folders
RUN chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
&& chmod -R g+ws /var/www/html/assets /var/www/html/cache
