#!/bin/bash

TESTDIR=`pwd|perl -pi -e 's@/test/.*@/test@'`

# TODO: Put environment setup/teardown PHP calls back in once activity E2E test development is complete.  2014-05 DDW
# php $TESTDIR/app/setupTestEnvironment.php
node $TESTDIR/node_modules/protractor/bin/protractor $1 $TESTDIR/protractorConf.js --verbose --specs "`find . -wholename "*e2e*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"
# php $TESTDIR/app/teardownTestEnvironment.php

