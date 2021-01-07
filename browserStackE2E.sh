#!/usr/bin/env bash
# Usage
# rune2e.sh lf                                   : runs E2E tests for LF
# rune2e.sh sf                                   : runs E2E tests for SF
# rune2e.sh jp                                   : runs E2E tests for JP
# rune2e.sh lf --specs lexicon-new-project       : runs lexicon-new-project spec for LF
#
# Note, make sure webdriver-manager is running
# gulp test-e2e-webdriver_standalone

E2EHOSTNAME="e2etest.languageforge.localhost"
gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
STATUS=$?

# Ensure cleanup
gulp test-e2e-teardownTestEnvironment
gulp test-e2e-useLiveConfig
gulp test-restart-webserver
exit $STATUS
