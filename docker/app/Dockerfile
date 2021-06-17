FROM sillsdev/web-languageforge:app-base-staging

# php customizations
RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini
COPY docker/app/customizations.php.ini $PHP_INI_DIR/conf.d/
COPY docker/app/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/app/000-default.conf /etc/apache2/sites-enabled

# install app dependencies
COPY src/composer.json src/composer.lock /var/www/html/
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

# copy app into image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# grab the built assets from the ui image
COPY --from=lf-ui-builder /data/src/dist /var/www/html/dist

# ensure correct write permissions for assets folders, 
RUN    chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
    && chmod -R g+ws /var/www/html/assets /var/www/html/cache \
    && umask 0002