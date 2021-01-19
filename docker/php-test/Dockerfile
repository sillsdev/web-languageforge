FROM php:7.3-cli
# this cannot be run from this directory, instead from the root folder, do:
# docker build -t test:php-api -f docker/php-api/Dockerfile .

# Extensions we know LF requires/desires:
# curl - already provided in image
# mbstring - already provided in image
# xdebug
# intl
# gd
# mongodb
#
# see https://github.com/mlocati/docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd xdebug mongodb intl @composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip git

# Pull in Language Forge git repo
# both src and test folders are needed in order to run tests
RUN mkdir -p /data/src
COPY src /data/src

# todo configure php.ini

WORKDIR /data/src
RUN composer install
WORKDIR /data

# run tests
CMD ["src/vendor/bin/phpunit", "--configuration", "test/php/phpunit.xml"]
