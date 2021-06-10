#!/bin/sh

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

attach_debugger &
cd /data
if [ -n "$TEST_SPECS" ]; then
  npm run test-e2e -- "--specs=${TEST_SPECS}"
else
  npm run test-e2e
fi

STATUS=$?

exit $STATUS
