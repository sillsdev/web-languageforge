#!/bin/bash
# Run tests when they are changed.
# Usage:
#   src/SIL.XForge.Scripture/ClientApp/monitor-test-headless.sh

readonly ROOT_PATH="$(dirname "$0")"

command -v inotifywait >/dev/null || {
  echo "Prerequisite not found. Run sudo apt install inotify-tools"
  exit 1
}

echo "Press CTRL-C to stop automatically running tests when files are saved."

"$ROOT_PATH"/test-headless.sh
while inotifywait -qre close_write --format "" "$ROOT_PATH"; do
  "$ROOT_PATH"/test-headless.sh
done
