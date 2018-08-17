#!/usr/bin/env bash

chromeDriverPath=`find $PWD -executable -iname "chromedriver*" -atime -30 -type f | tail -n1`

seleniumDriverPath=`find $PWD -type f | grep "selenium-server-standalone.jar" | tail -n1`

java -jar -Dwebdriver.chrome.driver=$chromeDriverPath $seleniumDriverPath -port 4444 -browserTimeout 0 -timeout 1800
