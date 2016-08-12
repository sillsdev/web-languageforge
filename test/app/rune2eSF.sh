#!/usr/bin/env bash

sh useTestConfig.sh
sudo -u www-data php setupTestEnvironment.php "scriptureforge.local"
if [ $# -eq 0 ]
  then
    node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js
  else
    node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js $2 --specs "./allspecs/e2e/*.spec.js,`find . -wholename "*scriptureforge*e2e*$1*.spec.js" -printf "%p,"|perl -p -e 's/,$//'`"
fi
sudo -u www-data php teardownTestEnvironment.php
sh useLiveConfig.sh
