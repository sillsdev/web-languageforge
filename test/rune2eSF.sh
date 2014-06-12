php app/setupTestEnvironment.php
if [ $# -eq 0 ]
  then
    node ./node_modules/protractor/bin/protractor protractorConf.js
  else
    node ./node_modules/protractor/bin/protractor protractorConf.js --specs "`find . -wholename "*e2e*$1*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
fi
php app/teardownTestEnvironment.php
