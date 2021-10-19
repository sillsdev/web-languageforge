#!/bin/bash

cd /var/www/
echo "##teamcity[importData type='junit' path='PhpUnitTests.xml']"
# src/vendor/bin/phpunit --configuration test/php/phpunit.xml --log-junit PhpUnitTests.xml
src/vendor/bin/phpunit --configuration test/php/phpunit.xml --log-junit PhpUnitTests.xml --testsuite lexEntryCommands
