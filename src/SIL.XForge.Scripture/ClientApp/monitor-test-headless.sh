#!/bin/bash
# Run tests when they are changed.
# Usage:
#   src/SIL.XForge.Scripture/ClientApp/monitor-test-headless.sh [arguments to test-headless.sh]

readonly ROOT_PATH="$(dirname "$0")"

command -v inotifywait >/dev/null || {
  echo "Prerequisite not found. Run sudo apt install inotify-tools"
  exit 1
}

echo -n "Press CTRL-C to stop automatically running tests when files are saved. "
echo "If that fails, in another terminal first run killall ng; sleep 1s; killall -9 ng"

"$ROOT_PATH"/test-headless.sh "$@"
while inotifywait -qre close_write --format "" "$ROOT_PATH"; do
  "$ROOT_PATH"/test-headless.sh "$@"
done
