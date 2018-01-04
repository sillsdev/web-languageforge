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

#rm -rf node_modules
npm install
cd src
composer install
gulp test-e2e-webdriver_update
../cleanup_css.sh
gulp sass
gulp build-webpack --applicationName $APP_NAME --doNoCompression true
echo -e "\n---------Finished refreshing npm, composer, webdriver, sass and webpack build----------"
