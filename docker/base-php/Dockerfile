# This image is based on debian 11 bullseye
# https://hub.docker.com/layers/library/php/7.4-apache/images/sha256-c44681664d111addef2a2b6598901609990d45047b874c87d7d40fc7ce269195
FROM php:7.4-apache

# Update package list and install necessary tools
RUN apt-get update \
    && apt-get install -y gnupg

# Add MongoDB's GPG key
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Add MongoDB to the list of apt repositories
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# install apt packages
# p7zip-full - used by LF application for unzipping lexicon uploads
# unzip - used by LF application for unzipping lexicon uploads
# curl - used by LF application
# ffmpeg - used by LF audio upload method
# mongodb-org-tools - contains mongoimport/mongoexport used by LF backup/restore project commands
# mongodb-mongosh - contains mongosh which is useful for querying the db from the app container
RUN apt-get update && apt-get -y install p7zip-full mongodb-org-tools mongodb-mongosh unzip curl tini ffmpeg && rm -rf /var/lib/apt/lists/*

# see https://github.com/mlocati/docker-php-extension-installer
# PHP extensions required by the LF application
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions mongodb intl

# php customizations
COPY docker/base-php/customizations.php.ini $PHP_INI_DIR/conf.d/

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/base-php/000-default.conf /etc/apache2/sites-enabled
