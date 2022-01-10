FROM php:7.3.28-apache

# install apt packages
# p7zip-full - used by LF application for unzipping lexicon uploads
# unzip - used by LF application for unzipping lexicon uploads
# gnupg2 - necessary for LFMerge package installation via SIL sources (will be uninstalled in production)
# curl - used by LF application
RUN apt-get update && apt-get -y install p7zip-full unzip gnupg2 curl && rm -rf /var/lib/apt/lists/*

# see https://github.com/mlocati/docker-php-extension-installer
# PHP extensions required by the LF application
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd mongodb intl
