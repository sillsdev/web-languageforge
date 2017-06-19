#!/usr/bin/env bash

npm install &
cd src
composer install &
rm -r vendor_bower
bower install &
wait
../cleanup_css.sh
gulp sass
echo -e "\n---------Finished refreshing npm, composer and bower----------"
