#!/usr/bin/env bash

chromeDriverPath=`find $PWD -type f | grep "chromedriver_2.40" | tail -n1`

seleniumDriverPath=`find $PWD -type f | grep "selenium-server-standalone.jar"`

java -jar -Dwebdriver.chrome.driver=$chromeDriverPath $seleniumDriverPath -port 4444 -browserTimeout 0 -timeout 1800
