# Base box creation instructions

When creating the base box, log in to the desktop immediately so gsettings will work.

Don't worry about a GUI low disk space warning near the end of provisioning, that's because of disk blanking.

It appears that if one section of provisioning fails, that it starts the next section rather than quitting the whole process. Check that each section completed successfully.

Don't halt the vagrant box too quickly after it finishes provisioning, so the zeros file has time to be deleted.

## Testing

After making the base box, you can do the following smoke test. Note that you should not publish the box that you did the smoke test in, since it won't be cleaned up from the original provision (such as deleting ssh host keys).

cd ~/src/web-languageforge
./refreshDeps.sh
gulp test-php
gulp webpack-sf
cd ~/src/web-languageforge/src/SIL.XForge.Scripture
dotnet run &

A longer test could be:

#!/bin/bash
set -e -o pipefail
cd ~/src/web-languageforge
./refreshDeps.sh
gulp test-php && gulp test-ts-lf && gulp test-ts-sf
gulp webpack-lf
gulp test-e2e-webdriver_standalone &
sleep 30s
./rune2e.sh lf
gulp webpack-sf
./rune2e.sh sf
cd ~/src/web-languageforge/src/SIL.XForge.Scripture
dotnet run &
