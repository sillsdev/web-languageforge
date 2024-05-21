# ENVIRONMENT value can be either "production" or "development"
ARG ENVIRONMENT=${ENVIRONMENT:-'production'}

# UI-BUILDER
FROM node:22.0.0-alpine3.18 AS ui-builder-base

RUN mkdir -p /data
WORKDIR /data

# Copy in files needed for compilation, located in the repo root
COPY typings ./typings/
COPY package.json webpack.config.js webpack-dev.config.js webpack-prd.config.js tsconfig.json tslint.json ./

# Use built node_modules from host
COPY node_modules ./node_modules/

# node-sass is platform dependent and so must be rebuilt inside docker
RUN npm rebuild node-sass

# copy in src local files
# Note: *.html files in src/angular-app aren't necessary for webpack compilation, however changes to HTML files will invalidate this layer
COPY src/angular-app ./src/angular-app
COPY src/sass ./src/sass
COPY src/Site/views/languageforge/theme/default/sass/ ./src/Site/views/languageforge/theme/default/sass
COPY src/Site/views/shared/*.scss ./src/Site/views/shared/

FROM ui-builder-base AS production-ui-builder
ENV NPM_BUILD_SUFFIX=prd

FROM ui-builder-base AS development-ui-builder
ENV NPM_BUILD_SUFFIX=dev

FROM ${ENVIRONMENT}-ui-builder AS ui-builder

# artifacts built to /data/src/dist
RUN npm run build:${NPM_BUILD_SUFFIX}

# COMPOSER-BUILDER
# download composer app dependencies
# git - needed for composer install
FROM sillsdev/web-languageforge:base-php AS composer-builder
ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /composer
COPY src/composer.json src/composer.lock /composer/
RUN composer install

# PRODUCTION IMAGE
FROM sillsdev/web-languageforge:base-php AS production-app
RUN rm /usr/local/bin/install-php-extensions /usr/local/bin/composer
RUN apt-get remove -y gnupg2 git
RUN mv $PHP_INI_DIR/php.ini-production $PHP_INI_DIR/php.ini
# had to add /wait into prod image so the prod image could be run through E2E tests.
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait

# DEVELOPMENT IMAGE
FROM sillsdev/web-languageforge:base-php AS development-app
RUN install-php-extensions xdebug-^3.1
COPY docker/app/docker-php-ext-xdebug.ini /usr/local/etc/php/conf.d
RUN mv $PHP_INI_DIR/php.ini-development $PHP_INI_DIR/php.ini
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait
COPY docker/app/run-with-wait.sh /run-with-wait.sh

FROM ${ENVIRONMENT}-app AS languageforge-app
ARG BUILD_VERSION=${BUILD_VERSION:-'9.9.9'}

# copy app into image
COPY src /var/www/html/
RUN ln -s /var/www/html /var/www/src

# grab the built assets from the ui image
COPY --from=ui-builder /data/src/dist /var/www/html/dist

# ensure correct write permissions for assets folders,
RUN    chown -R www-data:www-data /var/www/html/assets /var/www/html/cache \
    && chmod -R g+ws /var/www/html/assets /var/www/html/cache

COPY --from=composer-builder /composer/vendor /var/www/html/vendor

RUN echo "${BUILD_VERSION}" > build-version.txt \
    && sed -i "s/9.9.9/${BUILD_VERSION}/" version.php

ENTRYPOINT [ "tini", "-g", "--" ]
CMD [ "apache2-foreground" ]
