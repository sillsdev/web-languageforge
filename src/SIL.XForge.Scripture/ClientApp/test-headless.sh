#!/bin/bash
# Run tests in terminal.
# Usage:
#   src/SIL.XForge.Scripture/ClientApp/test-headless.sh [spec filenames to restrict to ...]
# Example:
#   src/SIL.XForge.Scripture/ClientApp/test-headless.sh foo.spec.ts baz.spec.ts

readonly ROOT_PATH="$(dirname "$0")"
readonly SETTINGS_FILE="${ROOT_PATH}/src/test.ts"
SPEC_FILES="$@"

# Re-write test.ts 'require.context' line to only use specific tests, rather than all spec.ts files.
filter_tests() {
  [[ -n ${SPEC_FILES} ]] || return

  for spec in ${SPEC_FILES}; do
    find -name "${spec}" | grep -q . || echo -e "\033[1;31mWarning: ${spec} not found.\033[0m"
  done

  SPEC_FILES="${SPEC_FILES// /|}"
  perl -pi -e "s:(require.context.*\, /).*(/\);)(.*$):\$1${SPEC_FILES}\$2 // Temporarily modified by test runner. Can revert.:" "${SETTINGS_FILE}"
}

cleanup() {
  [[ -n ${SPEC_FILES} ]] || return
  # Restore filter less bluntly than `git checkout`. May need to update if test.ts changes.
  readonly FILTER='\\.spec\\.ts\$'
  perl -pi -e "s:(require.context.*\, /).*(/\);)(.*$):\$1${FILTER}\$2:" "${SETTINGS_FILE}"
}

run() {
  echo -e "\033[1;34mRunning tests\033[0m"
  date +"%F %T"
  cd "$ROOT_PATH" &&
    time ng test --browsers ChromiumHeadless --watch false |
      grep -v '^.#' |
      grep -v '^Headless.*LOG' |
      # Highlight select text, and use |$ to make otherwise not-matching output come thru.
      grep --color -E '(.*FAILED|ts\?:[^:]*|^TOTAL.*$|^[[:blank:]]*Error:|$)'
  date +"%F %T"
}

filter_tests
run
cleanup
