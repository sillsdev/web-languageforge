FROM ubuntu:bionic

# setup for signed repositories
RUN apt-get update \
&& apt-get install --yes gnupg2 curl

# install lfmerge
RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
&& echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
&& apt-get update \
&& apt-get purge --yes curl \
&& apt-get install --yes --no-install-recommends lfmerge

# apparently we do the volume mapping in the docker compose file, not the Dockerfile
# todo volume map /var/lib/languageforge

# need some command here to keep the container active
# run cronjob every minute that calls lfmerge
