#!/usr/bin/env bash

echo
echo NOTE, make sure the server is running in test mode, i.e.: dotnet run --environment \"Testing\"
echo To debug, in one terminal run: ng serve   then in another run: ./rune2e.sh debug
echo    then browser to chrome://inspect/#devices and click inspect
echo

mongoimport --db xforge_test --collection users --drop --file e2e/data/mongodb-xforge_test-users.json

if [ "$1" = "debug" ]
  then
    node --inspect-brk ./node_modules/protractor/bin/protractor ./e2e/protractor.conf.js
else
    ng e2e
fi
