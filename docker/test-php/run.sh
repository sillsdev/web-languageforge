#!/bin/bash

cd /var/www/

# optionally add `--filter nameOfTestYouWantToRun`
# where the test name is the class name of the test group e.g. LexEntryModelTest
src/vendor/bin/phpunit --configuration test/php/phpunit.xml --filter ActivityListDtoTest --log-junit PhpUnitTests.xml
