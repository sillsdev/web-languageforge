FROM sillsdev/web-languageforge:base-app-latest

# php.ini customizations
COPY docker/app/php.ini /usr/local/etc/php

# apache2 module and virtual host customizations
RUN a2enmod headers rewrite
COPY docker/app/000-default.conf /etc/apache2/sites-enabled

# run composer install
COPY src/composer.json src/composer.lock /var/www/html/
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install

# copy src files into our image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# grab the built assets from the ui image
COPY --from=lf-ui-builder /data/src/dist /var/www/html/dist

# ensure correct write permissions for assets folders
RUN chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
&& chmod -R g+ws /var/www/html/assets /var/www/html/cache
