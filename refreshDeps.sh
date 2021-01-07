#!/usr/bin/env bash
# Usage
# ./refreshDeps.sh                                  : refreshes dependencies for LF

APP_NAME="languageforge"

gulp dev-dependencies-and-build --applicationName $APP_NAME --doNoCompression true
echo -e "\n---------Finished refreshing npm, composer, webdriver, sass and webpack build----------"
