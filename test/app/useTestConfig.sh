#!/bin/bash

TESTPATH=`pwd|perl -p -e 's@/test/.*@/test@'`
CONFIGPATH=$TESTPATH/../src

CONFIG=$CONFIGPATH/config.php

cp $CONFIG.fortest $CONFIG
