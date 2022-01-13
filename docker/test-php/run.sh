#!/bin/bash

cd /var/www/
src/vendor/bin/phpunit --configuration test/php/phpunit.xml --log-junit PhpUnitTests.xml
