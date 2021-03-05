FROM ubuntu:bionic

RUN echo "postfix postfix/main_mailer_type string Local only" > quiet-install-postfix.conf
RUN echo "postfix postfix/mailname string localhost" >> quiet-install-postfix.conf
RUN debconf-set-selections quiet-install-postfix.conf

RUN apt-get update && \
    apt-get install -y iwatch

RUN mkdir -p /data/dropzone

COPY watcher /data/
RUN chmod +x /data/watcher

CMD iwatch -c '/data/watcher %f' -e create /data/dropzone

