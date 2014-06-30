#!/bin/bash

TESTDIR=`pwd|perl -pi -e 's@/test/app/.*@/test/app@'`

php $TESTDIR/setupTestEnvironment.php
node $TESTDIR/node_modules/protractor/bin/protractor $1 $TESTDIR/protractorConf.js --verbose --specs "`find . -wholename "*e2e*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
php $TESTDIR/teardownTestEnvironment.php

