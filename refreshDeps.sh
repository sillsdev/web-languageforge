#!/usr/bin/env bash
# Usage
# ./refreshDeps.sh                                  : refreshes dependencies for LF
# ./refreshDeps.sh lf                               : refreshes dependencies for LF
# ./refreshDeps.sh sf                               : refreshes dependencies for SF

if [ "$1" = "lf" ]
  then
    APP_NAME="languageforge"
elif [ "$1" = "sf" ]
  then
    APP_NAME="scriptureforge"
else
    APP_NAME="languageforge"
fi

rm -r node_modules
npm install &
cd src
composer install &
wait
gulp test-e2e-webdriver_update &
../cleanup_css.sh
gulp sass
wait
gulp build-webpack --applicationName $APP_NAME --doNoCompression true
wait
echo -e "\n---------Finished refreshing npm, composer, webdriver, sass and webpack build----------"
