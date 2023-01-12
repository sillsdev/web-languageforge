FROM sillsdev/web-languageforge:base-php


WORKDIR /work
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions @composer
COPY src/composer.json src/composer.lock /work/

CMD ["bash"]
