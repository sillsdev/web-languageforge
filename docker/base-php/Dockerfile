# This image is based on debian 11 bullseye
# https://hub.docker.com/layers/library/php/7.4-apache/images/sha256-c44681664d111addef2a2b6598901609990d45047b874c87d7d40fc7ce269195
FROM php:7.4-apache

# Debian 11 (bullseye) reached end of life in August 2026 and its packages,
# including bullseye-security, now live only on archive.debian.org. Without
# this every apt-get below fails with 404s.
RUN set -eux; \
	sed -i \
		-e 's|http://deb.debian.org/debian-security|http://archive.debian.org/debian-security|g' \
		-e 's|http://deb.debian.org/debian|http://archive.debian.org/debian|g' \
		/etc/apt/sources.list; \
	echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99-archive-debian

# ---------------------------------------------------------------------------
# Rebuild PHP from the PHP security team's minimal backport branch for
# CVE-2026-109618 (RCE via OOM corruption) and CVE-2026-109619 (RCE via stale
# global state). See https://www.php.net/archive/2026.php#2026-10-21-5
#
# PHP 7.4 is end-of-life, so there is no 7.4 release containing the fix and the
# official php:7.4-apache image will never be rebuilt. The backport branch is
# https://github.com/php/php-src/tree/PHP-7.4-CVE-2026-109618-109619
#
# We recompile PHP in place, on top of the official image, using the exact
# configure flags the official image was built with (php-config
# --configure-options) so the layout, apache module, ini dirs and extension
# tooling (docker-php-ext-*, install-php-extensions) keep working unchanged.
# Extensions are installed further down and so build against the new headers.
#
# To move to a newer commit on the branch, update PHP_SRC_REF to the new SHA.
# ---------------------------------------------------------------------------
ARG PHP_SRC_REPO=https://github.com/php/php-src.git
ARG PHP_SRC_BRANCH=PHP-7.4-CVE-2026-109618-109619
ARG PHP_SRC_REF=712e60f9edfd03f0960fc4fc3c2c375f42b90aa2
RUN set -eux; \
	savedAptMark="$(apt-mark showmanual)"; \
	apt-get update; \
	apt-get install -y --no-install-recommends \
		git \
		bison \
		apache2-dev \
		libargon2-dev \
		libcurl4-openssl-dev \
		libonig-dev \
		libreadline-dev \
		libsodium-dev \
		libsqlite3-dev \
		libssl-dev \
		libxml2-dev \
		zlib1g-dev \
	; \
	\
	git clone --depth 1 --branch "$PHP_SRC_BRANCH" "$PHP_SRC_REPO" /usr/src/php-src; \
	cd /usr/src/php-src; \
	# fail the build if the branch has moved away from the reviewed commit
	test "$(git rev-parse HEAD)" = "$PHP_SRC_REF"; \
	\
	export \
		CFLAGS="$PHP_CFLAGS" \
		CPPFLAGS="$PHP_CPPFLAGS" \
		LDFLAGS="$PHP_LDFLAGS" \
	; \
	debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"; \
	# https://bugs.php.net/bug.php?id=74125
	if [ ! -d /usr/include/curl ] && [ ! -e /usr/local/include/curl ]; then \
		ln -sT "/usr/include/$debMultiarch/curl" /usr/local/include/curl; \
	fi; \
	\
	./buildconf --force; \
	eval ./configure "$(php-config --configure-options)"; \
	make -j "$(nproc)"; \
	find -type f -name '*.a' -delete; \
	make install; \
	find \
		/usr/local \
		-type f \
		-perm '/0111' \
		-exec sh -euxc ' \
			strip --strip-all "$@" || : \
		' -- '{}' + \
	; \
	cp -v php.ini-* "$PHP_INI_DIR/"; \
	cd /; \
	rm -rf /usr/src/php-src; \
	\
	# remove build dependencies again, same approach as the official image
	apt-mark auto '.*' > /dev/null; \
	[ -z "$savedAptMark" ] || apt-mark manual $savedAptMark; \
	find /usr/local -type f -executable -exec ldd '{}' ';' \
		| awk '/=>/ { print $(NF-1) }' \
		| sort -u \
		| xargs -r dpkg-query --search \
		| cut -d: -f1 \
		| sort -u \
		| xargs -r apt-mark manual \
	; \
	apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
	rm -rf /var/lib/apt/lists/*; \
	\
	# smoke test: the rebuilt binary and apache module must load
	php --version; \
	php -m; \
	apache2ctl -M | grep -q php7_module

# install apt packages
# gnupg - for installing Mongo GPG key below
# git - for use by composer to install dependencies
# p7zip-full - used by LF application for unzipping lexicon uploads
# unzip - used by LF application for unzipping lexicon uploads
# curl - used by LF application
# ffmpeg - used by LF audio upload method
RUN apt-get update && apt-get -y install gnupg git p7zip-full unzip curl tini ffmpeg

# Install MongoDB shell and tools (must be done after gnupg is installed)
# mongodb-org-tools - contains mongoimport/mongoexport used by LF backup/restore project commands
# mongodb-mongosh - contains mongosh which is useful for querying the db from the app container
RUN curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
RUN echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
RUN apt-get update && apt-get -y install mongodb-org-tools mongodb-mongosh && rm -rf /var/lib/apt/lists/*

# see https://github.com/mlocati/docker-php-extension-installer
# PHP extensions required by the LF application
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
# mongodb is pinned to the version the previously published image shipped with:
# 1.20 deprecates the integer ReadPreference modes still used by the
# mongodb/mongodb 1.15 library in composer.lock, which floods the logs.
RUN install-php-extensions mongodb-1.19.0 intl @composer

# php customizations
COPY docker/base-php/customizations.php.ini $PHP_INI_DIR/conf.d/

# apache2 customizations
RUN a2enmod headers rewrite
COPY docker/base-php/000-default.conf /etc/apache2/sites-enabled
