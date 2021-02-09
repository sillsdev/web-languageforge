FROM lf-api

RUN mkdir -p /data
COPY test /data/test

# the docs folder is needed by tests
# apparently some tests use USX files in this directory - very suspicious.
# TODO move test fixtures out of docs directory
COPY docs /data/docs
RUN ln -s /var/www/html /data/src

WORKDIR /data

# run tests
# src/vendor/bin/phpunit --configuration test/php/phpunit.xml
CMD ["src/vendor/bin/phpunit", "--configuration", "test/php/phpunit.xml"]
