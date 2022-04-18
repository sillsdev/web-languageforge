#!/bin/bash

cd /var/www/

# optionally add `--filter nameOfTestYouWantToRun`
src/vendor/bin/phpunit --configuration test/php/phpunit.xml --log-junit PhpUnitTests.xml
