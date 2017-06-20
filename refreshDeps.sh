#!/usr/bin/env bash

rm -r node_modules
npm install &
cd src
composer install &
rm -r vendor_bower
bower install &
wait
gulp test-e2e-webdriver_update &
../cleanup_css.sh
gulp sass
wait
echo -e "\n---------Finished refreshing npm, composer and bower----------"
