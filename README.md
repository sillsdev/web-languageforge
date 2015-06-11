web-languageforge
=================

## Building with gulp

(For installation of npm see https://github.com/nodesource/distributions)

Install gulp and dependencies by running

    npm install gulp gulp-util async gulp-livereload tiny-lr

Afterwards you can build by running (from the root directory of the source tree):

    gulp

To install the mongodb databases locally, run:

	gulp copy-prod-db
