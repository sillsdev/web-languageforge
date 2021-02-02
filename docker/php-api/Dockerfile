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
# - name: copy apache2 service config from /lib to /etc for modification
# copy:
# src: /lib/systemd/system/apache2.service
# dest: /etc/systemd/system/apache2.service
# owner: root
# group: root
# mode: 0644

# - name: disable systemd /tmp isolation for apache2
# lineinfile:
# dest: /etc/systemd/system/apache2.service
# regexp: '^#?PrivateTmp=true'
# line: "PrivateTmp=false"



# apt packages to investigate further
#   - default-jre-headless
