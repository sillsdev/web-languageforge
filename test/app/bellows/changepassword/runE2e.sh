#!/bin/bash

TESTDIR=`pwd|perl -pi -e 's@/test/.*@/test@'`

php $TESTDIR/app/setupTestEnvironment.php
node $TESTDIR/node_modules/protractor/bin/protractor $1 $TESTDIR/protractorConf.js --verbose --specs "`find . -wholename "*e2e*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
php $TESTDIR/app/teardownTestEnvironment.php

