sh useTestConfig.sh
sudo -u www-data php setupTestEnvironment.php "languageforge.local"
if [ $# -eq 0 ]
  then
    node ./node_modules/protractor/bin/protractor protractorConfLF.js
  else
    node ./node_modules/protractor/bin/protractor protractorConfLF.js --specs "`find . -wholename "*languageforge*e2e*$1*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
fi
php teardownTestEnvironment.php
sh useLiveConfig.sh