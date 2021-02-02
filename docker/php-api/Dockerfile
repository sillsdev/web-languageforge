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
RUN install-php-extensions gd xdebug mongodb intl @composer

# install Language Forge APT dependencies
# insalling git to avoid composer error "Cloning failed using an ssh key for authentication, enter your GitHub credentials to access private repos"
RUN apt-get update && apt-get -y install p7zip-full unzip git


# Pull in Language Forge git repo
COPY src /var/www/html

RUN composer install

# TODO: configure apache
RUN a2enmod headers rewrite

COPY docker/php-api/000-default.conf /etc/apache2/sites-enabled
COPY docker/php-api/apache2.service /etc/systemd/system
