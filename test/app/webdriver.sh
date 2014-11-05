#!/bin/bash

REPO_ROOT=$(git rev-parse --show-toplevel)

if [ -z "$REPO_ROOT" ]
then
    # Error message has already been printed by git rev-parse
    exit 2
fi

NODE=$(which nodejs || which node)

$NODE $REPO_ROOT/test/app/node_modules/protractor/bin/webdriver-manager "$@"
