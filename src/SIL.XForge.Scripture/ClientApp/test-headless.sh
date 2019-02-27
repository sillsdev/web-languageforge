#!/bin/bash
# Run tests in terminal.
# Usage:
#   src/SIL.XForge.Scripture/ClientApp/test-headless.sh

readonly ROOT_PATH="$(dirname "$0")"

echo -e "\033[1;34mRunning tests\033[0m"
date +"%F %T"
cd "$ROOT_PATH" &&
  time ng test --browsers ChromiumHeadless --watch false |
    grep -v '^.#' |
    grep -v '^Headless.*LOG' |
    # Highlight select text, and use |$ to make otherwise not-matching output come thru.
    grep --color -E '(.*FAILED|ts\?:[^:]*|^TOTAL.*$|^[[:blank:]]*Error:|$)'
date +"%F %T"
