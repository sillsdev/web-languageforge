#!/bin/bash

/wait
cd /var/www/
src/vendor/bin/phpunit --configuration test/php/phpunit.xml
