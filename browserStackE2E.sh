#!/usr/bin/env bash
# Usage
# rune2e.sh lf                                   : runs E2E tests for LF
# rune2e.sh sf                                   : runs E2E tests for SF
# rune2e.sh jp                                   : runs E2E tests for JP
# rune2e.sh lf --specs lexicon-new-project       : runs lexicon-new-project spec for LF
#
# Note, make sure webdriver-manager is running
# gulp test-e2e-webdriver_standalone

if [ "$1" = "sf" ]
  then
    E2EHOSTNAME="e2etest.scriptureforge.org"
else
    E2EHOSTNAME="e2etest.languageforge.org"
fi
gulp test-e2e-run --conf protractorConfBrowserStack.js --webserverHost $E2EHOSTNAME ${@:2}
STATUS=$?

# Ensure cleanup
gulp test-e2e-teardownTestEnvironment
gulp test-e2e-useLiveConfig
gulp test-restart-webserver
exit $STATUS