#!/bin/bash

TESTPATH=`pwd|perl -pi -e 's@/test/.*@/test@'`
CONFIGPATH=$TESTPATH/../src/config

SFCONFIG=$CONFIGPATH/sf_config.php
MONGOCONFIG=$CONFIGPATH/mongodb.php

cp $SFCONFIG.live $SFCONFIG
cp $MONGOCONFIG.live $MONGOCONFIG
