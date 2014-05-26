#!/bin/bash

CONFIGPATH=../../src/config
SFCONFIG=$CONFIGPATH/sf_config.php
MONGOCONFIG=$CONFIGPATH/mongodb.php

cp $SFCONFIG.fortest $SFCONFIG
cp $MONGOCONFIG.fortest $MONGOCONFIG
