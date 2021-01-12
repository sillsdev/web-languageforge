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
RUN install-php-extensions gd xdebug mongodb curl intl
RUN install-php-extensions @composer

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip

# Pull in Language Forge git repo
RUN mkdir -p /data
WORKDIR /data
COPY . /data



# apt packages to investigate further
#   - default-jre-headless
#   - lfmerge
#   - nodejs
#   - postfix
#   - git
#
#
#

# it feels like these should run in separate containers:
# nodejs
# postfix (for sending email)
# lfmerge
