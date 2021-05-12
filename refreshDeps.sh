#!/bin/bash
# Usage
# ./refreshDeps.sh : refreshes PHP and NPM dependencies for LF

(cd src && composer install)
npm install
echo -e "\n---------Finished refreshing npm and composer----------"
