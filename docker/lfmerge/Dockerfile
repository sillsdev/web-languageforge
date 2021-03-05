FROM ubuntu:bionic

# iwatch requires postfix and this is the only way I could figure out to configure it non-interactively
RUN echo "postfix postfix/main_mailer_type string Local only" > quiet-install-postfix.conf
RUN echo "postfix postfix/mailname string localhost" >> quiet-install-postfix.conf
RUN debconf-set-selections quiet-install-postfix.conf

RUN apt-get update \
 && apt-get install -y iwatch gnupg2 curl

RUN curl -L http://linux.lsdev.sil.org/downloads/sil-testing.gpg | apt-key add - \
 && echo "deb http://linux.lsdev.sil.org/ubuntu bionic main" > /etc/apt/sources.list.d/linux-lsdev-sil-org.list \
 && apt-get update \
 && apt-get purge --yes curl \
 && apt-get install --yes --no-install-recommends lfmerge

CMD iwatch -c /usr/bin/lfmergeqm -e create /var/lib/languageforge/lexicon/sendreceive/syncqueue
