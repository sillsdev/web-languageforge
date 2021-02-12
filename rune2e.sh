#!/usr/bin/env bash
# Usage
# rune2e.sh lf                                   : runs E2E tests for LF
# rune2e.sh sf                                   : runs E2E tests for SF
# rune2e.sh jp                                   : runs E2E tests for JP
# rune2e.sh lf --specs lexicon-new-project       : runs lexicon-new-project spec for LF
#
# Note, make sure webdriver-manager is running
# gulp test-e2e-webdriver_standalone

attach_debugger () {
  # Searches for the Node process running Protractor tests, then signals for it to attach the debugger
  echo "Waiting for a Protractor process to appear so the debugger can be attached..."

  PID=""
  while [ "$PID" = "" ]; do
    sleep 0.25;
    PID=$(pgrep -f protractor/built/cli.js)
  done

  # See https://nodejs.org/en/docs/guides/debugging-getting-started/
  kill -s SIGUSR1 "$PID"
  echo "Protractor process signaled to have debugger listen."
}

# docker-compose-wait
/wait

attach_debugger &
gulp test-e2e-clean-compile
gulp test-e2e-doTest --webserverHost e2e ${@:2}
STATUS=$?

# we cannot actually do a teardown because these scripts are written in PHP
# gulp test-e2e-teardownForLocalDev
exit $STATUS
