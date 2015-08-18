#!/bin/bash

TESTPATH=`pwd|perl -pi -e 's@/test/.*@/test@'`
CONFIGPATH=$TESTPATH/../src

CONFIG=$CONFIGPATH/config.php

cp $CONFIG.fortest $CONFIG
