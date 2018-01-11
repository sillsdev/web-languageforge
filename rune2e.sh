#!/usr/bin/env bash
# Usage
# rune2e.sh lf                                   : runs E2E tests for LF
# rune2e.sh sf                                   : runs E2E tests for SF
# run2e2.sh xf                                   : runs E2E tests for both LF and SF (only runs bellows tasks once)
# rune2e.sh jp                                   : runs E2E tests for JP
# rune2e.sh lf --specs lexicon-new-project       : runs lexicon-new-project spec for LF
#
# Note, make sure webdriver-manager is running
# gulp test-e2e-webdriver_standalone

if [ "$1" = "lf" ]
  then
    E2EHOSTNAME="languageforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
elif [ "$1" = "sf" ]
  then
    E2EHOSTNAME="scriptureforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
elif [ "$1" = "xf" ]
  then
    E2EHOSTNAME="languageforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
    gulp test-e2e-teardownTestEnvironment    #need to do this before switching hostname
    E2EHOSTNAME="scriptureforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2} --excludeBellows


elif [ "$1" = "jp" ]
  then
    E2EHOSTNAME="jamaicanpsalms.scriptureforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
else
    E2EHOSTNAME="languageforge.local"
    gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
fi

# Ensure Cleanup

STATUS=$?
gulp test-e2e-teardownTestEnvironment
gulp test-e2e-useLiveConfig
gulp test-restart-webserver
exit $STATUS
