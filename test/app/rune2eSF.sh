sh useTestConfig.sh
sudo -u www-data php setupTestEnvironment.php "scriptureforge.local"
if [ $# -eq 0 ]
  then
    node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js
  else
    node ./node_modules/protractor/bin/protractor protractorConf.scriptureforge.js --specs "`find . -wholename "*scriptureforge*e2e*$1*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
fi
php teardownTestEnvironment.php
sh useLiveConfig.sh
