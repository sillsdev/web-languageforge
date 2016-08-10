#!/usr/bin/env bash

sh useTestConfig.sh
sudo -u www-data php setupTestEnvironment.php "languageforge.local"
if [ $# -eq 0 ]
  then
    node ./node_modules/protractor/bin/protractor protractorConf.languageforge.js
  else
    node ./node_modules/protractor/bin/protractor protractorConf.languageforge.js $2 --specs "./allspecs/e2e/*.spec.js,`find . -wholename "*languageforge*e2e*$1*.spec.js" -printf "%p,"|perl -p -e 's/,$//'`"
fi
sudo -u www-data php teardownTestEnvironment.php
sh useLiveConfig.sh
