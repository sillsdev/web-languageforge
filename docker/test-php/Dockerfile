FROM sillsdev/web-languageforge:base-php-7.4


# ----- LINES BELOW COPIED FROM APP DOCKERFILE ----------
WORKDIR /var/www/html
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions @composer
COPY src/composer.json src/composer.lock /var/www/html/
RUN composer install

RUN install-php-extensions xdebug
COPY docker/app/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d

RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait

# copy src files into image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# ensure correct write permissions for assets folders,
RUN    chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
    && chmod -R g+ws /var/www/html/assets /var/www/html/cache

# patch exception handling from Symfony to actually show exceptions instead of swallowing them
COPY docker/app/symfony-exceptions.patch /
RUN patch -p4 -i /symfony-exceptions.patch

# -------- END COPY FROM APP DOCKERFILE --------------


# PHP test specific lines
COPY test /var/www/test/
COPY docker/test-php/run.sh /run.sh

CMD ["/run.sh"]
