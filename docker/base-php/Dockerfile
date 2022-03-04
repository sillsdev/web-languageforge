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

# install and configure LFMerge
# LFMerge required apt packages
# python - required by Mercurial (written in Python), which is bundled in the LFMerge apt package
# lfmerge - main package, from SIL sources
# rsyslog - lfmerge logs to rsyslog and expects this to exist
# logrotate - TODO: is this required?
# iputils-ping - Chorus (part of LFMerge) requires the "ping" command to be available on the command line
RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt-get update \
&& apt-get install --yes --no-install-recommends python lfmerge rsyslog logrotate iputils-ping \
&& rm -rf /var/lib/apt/lists/*
COPY docker/base-php/lfmerge.conf /etc/languageforge/conf/sendreceive.conf
COPY docker/base-php/lfmergeqm-background.sh /
RUN adduser www-data fieldworks \
&& chown -R www-data:www-data /var/lib/languageforge \
&& chmod 0755 /var/lib/languageforge \
&& mkdir -m 02775 -p /var/www/.local \
&& chown www-data:www-data /var/www/.local

# rsyslog customizations (imklog reads kernel messages, which isn't allowed or desired in Docker containers)
RUN sed -i '/load="imklog"/s/^/#/' /etc/rsyslog.conf

# php customizations
COPY docker/base-php/customizations.php.ini $PHP_INI_DIR/conf.d/

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/base-php/000-default.conf /etc/apache2/sites-enabled
