FROM php:7.3-apache

# install Language Forge APT dependencies
RUN apt-get update && apt-get -y install p7zip-full unzip git gnupg2 curl

# see https://github.com/mlocati/docker-php-extension-installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd xdebug mongodb intl @composer

# install LFMerge
RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt-get update \
&& apt-get install --yes --no-install-recommends lfmerge

# setup LFMerge permissions
# TODO: we may not actually need to add www-data to the fieldworks group.  Needs testing
RUN adduser www-data fieldworks \
&& chown -R www-data:www-data /var/lib/languageforge \
&& chmod 0755 /var/lib/languageforge \
&& mkdir -m 02775 -p /var/www/.local \
&& chown www-data:www-data /var/www/.local

# make wait available for container ochestration
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait
