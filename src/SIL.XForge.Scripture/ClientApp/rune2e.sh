#!/usr/bin/env bash

echo
echo NOTE, make sure the server is running in test mode, i.e.: dotnet run --environment \"Testing\"
echo

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

mongoimport --db xforge_test --collection users --drop --file e2e/data/mongodb-xforge_test-users.json
ng e2e

STATUS=$?
exit $STATUS
