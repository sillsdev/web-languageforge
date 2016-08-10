#!/bin/bash

TESTDIR=`pwd|perl -p -e 's@/test/app/.*@/test/app@'`

sh $TESTDIR/useTestConfig.sh
sudo -u www-data php $TESTDIR/setupTestEnvironment.php "scriptureforge.local"
node $TESTDIR/node_modules/protractor/bin/protractor $TESTDIR/protractorConf.scriptureforge.js $2 --specs "$TESTDIR/allspecs/e2e/*.spec.js,`find . -wholename "*e2e*$1*.spec.js" -printf "%p,"|perl -p -e 's/,$//'`"
sudo -u www-data php $TESTDIR/teardownTestEnvironment.php
sh $TESTDIR/useLiveConfig.sh
