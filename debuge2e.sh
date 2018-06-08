#!/bin/bash

# Searches for the Node process running Protractor tests, then signals for it to attach the debugger
# You can run this script before starting the e2e tests and it will send the signal once the process is found.

set -eu

echo "Waiting for a Protractor process to appear so the debugger can be attached..."

PID=""
while [ "$PID" = "" ]; do
  PID=$(pgrep -f protractor/built/cli.js) || true
  sleep 0.25;
done

# Send SIGUSR1 to the Node process so it will attach to the debugger
# See https://nodejs.org/en/docs/guides/debugging-getting-started/
kill -s SIGUSR1 "$PID"
