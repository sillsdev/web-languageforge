#!/bin/bash

TESTDIR=`pwd|perl -pi -e 's@/test/.*@/test@'`

node $TESTDIR/node_modules/protractor/bin/protractor $TESTDIR/protractorConf.js --verbose --specs "`find . -wholename "*e2e*.spec.js" -printf "%p,"|perl -pi -e 's/,$//'`"

