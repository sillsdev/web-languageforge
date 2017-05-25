#!/bin/bash

# delete untracked CSS files in the given paths
git ls-files --others src/{Site,angular-app}/**/*.css | xargs rm
# Remove empty bootstrap4 directories
find . -type d -empty -name bootstrap4 -delete
