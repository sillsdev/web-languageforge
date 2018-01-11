#!/usr/bin/env bash
# Usage
# rune2e.sh lf                                   : runs E2E tests for LF
# rune2e.sh sf                                   : runs E2E tests for SF
# rune2e.sh jp                                   : runs E2E tests for JP
# rune2e.sh lf --specs lexicon-new-project       : runs lexicon-new-project spec for LF
#
# Note, make sure webdriver-manager is running
# gulp test-e2e-webdriver_standalone

if [ "$1" = "lf" ]
  then
    E2EHOSTNAME="languageforge.local"
elif [ "$1" = "sf" ]
  then
    E2EHOSTNAME="scriptureforge.local"
elif [ "$1" = "xf" ]
#run both lf and sf tests, but don't repeat the tests common to both
  then
    #run bellows and LF tests
    E2EHOSTNAME="languageforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
    gulp test-e2e-teardownTestEnvironment
    #run SF specific tests
    E2EHOSTNAME="scriptureforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs activity
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs project
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs projectSettings
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs question
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs text
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --specs textSettings

    # Ensure cleanup
    gulp test-e2e-teardownTestEnvironment
    gulp test-e2e-useLiveConfig
    gulp test-restart-webserver
    exit $STATUS

elif [ "$1" = "jp" ]
  then
    E2EHOSTNAME="jamaicanpsalms.scriptureforge.local"
else
    E2EHOSTNAME="languageforge.local"
fi
gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
STATUS=$?

# Ensure cleanup
gulp test-e2e-teardownTestEnvironment
gulp test-e2e-useLiveConfig
gulp test-restart-webserver
exit $STATUS
