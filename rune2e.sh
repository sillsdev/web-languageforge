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
elif [ "$1" = "jp" ]
  then
    E2EHOSTNAME="jamaicanpsalms.scriptureforge.local"
else
    E2EHOSTNAME="languageforge.local"
fi

attach_debugger () {
  # Searches for the Node process running Protractor tests, then signals for it to attach the debugger
  echo "Waiting for a Protractor process to appear so the debugger can be attached..."

  PID=""
  while [ "$PID" = "" ]; do
    PID=$(pgrep -f protractor/built/cli.js)
    sleep 0.25;
  done

  # See https://nodejs.org/en/docs/guides/debugging-getting-started/
  kill -s SIGUSR1 "$PID"
  echo "Protractor process signaled to have debugger listen."
}

attach_debugger &
gulp test-e2e-run --webserverHost $E2EHOSTNAME ${@:2}
STATUS=$?
gulp test-e2e-teardownForLocalDev
exit $STATUS
