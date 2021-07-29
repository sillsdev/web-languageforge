ARG ENVIRONMENT=production

# APP-BASE
FROM php:7.3.28-apache AS base-app

# install apt packages
# p7zip-full - used by LF application for unzipping lexicon uploads
# unzip - used by LF application for unzipping lexicon uploads
# git - TODO: why do we need git?
# gnupg2 - necessary for LFMerge package installation via SIL sources (will be uninstalled in production)
# curl - used by LF application
RUN apt-get update && apt-get -y install p7zip-full unzip git gnupg2 curl

# see https://github.com/mlocati/docker-php-extension-installer
# PHP extensions required by the LF application
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd mongodb intl

# install and configure LFMerge
RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt-get update \
&& apt-get install --yes --no-install-recommends python lfmerge rsyslog logrotate cron iputils-ping
COPY docker/app/lfmerge.conf /etc/languageforge/conf/sendreceive.conf
COPY docker/app/lfmergeqm-background.sh /
RUN adduser www-data fieldworks \
&& chown -R www-data:www-data /var/lib/languageforge \
&& chmod 0755 /var/lib/languageforge \
&& mkdir -m 02775 -p /var/www/.local \
&& chown www-data:www-data /var/www/.local

# php customizations
COPY docker/app/customizations.php.ini $PHP_INI_DIR/conf.d/

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/app/000-default.conf /etc/apache2/sites-enabled

# copy app into image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# grab the built assets from the ui image
# TODO distinguish between production and dev builds here
COPY --from=lf-ui-builder /data/src/dist /var/www/html/dist

# ensure correct write permissions for assets folders,
RUN    chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
    && chmod -R g+ws /var/www/html/assets /var/www/html/cache

COPY docker/app/entrypoint.sh /

# COMPOSER-BUILDER
# download composer app dependencies
FROM base-app AS composer-builder
RUN install-php-extensions @composer
RUN mkdir /composer
WORKDIR /composer
COPY src/composer.json src/composer.lock /composer/
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

FROM base-app AS production-app
RUN rm /usr/local/bin/install-php-extensions
RUN apt-get remove -y gnupg2
RUN mv $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini


FROM base-app AS development-app
RUN install-php-extensions xdebug
COPY docker/app/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d
RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait

FROM ${ENVIRONMENT}-app AS languageforge-app

COPY --from=composer-builder /composer/vendor /var/www/html/vendor
ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "apache2-foreground" ]
