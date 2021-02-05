FROM php-api:latest

RUN mkdir -p /data
COPY test /data/test
RUN ln -s /var/www/html /data/src

WORKDIR /data

# run tests
CMD ["src/vendor/bin/phpunit", "--configuration", "test/php/phpunit.xml"]
