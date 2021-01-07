# this cannot be run from this directory, instead from the root folder, do:
# docker build -t test:php-api -f docker/php-api/Dockerfile .

FROM php:7.3-apache

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
RUN install-php-extensions gd xdebug mongodb intl
RUN install-php-extensions @composer

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip

# Pull in Language Forge git repo
COPY src /var/www/html
WORKDIR /var/www/html

# TODO configure php.ini

# TODO configure apache

# what port should we use for the API ?
EXPOSE 80


# apt packages to investigate further
#   - default-jre-headless
#   - nodejs
#   - git
#
#
#

# it feels like these should run in separate containers:
# nodejs
# lfmerge
