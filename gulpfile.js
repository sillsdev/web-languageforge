'use strict';

// *************************************
//
//   Gulpfile
//
// *************************************
//
// -------------------------------------
// To see available tasks use:
// gulp -T                 Print the task dependency tree
// gulp --tasks-simple     Print a list of gulp task names
// -------------------------------------
//
// -------------------------------------
//   Modules
// -------------------------------------
require('es6-shim');
var _execute = require('child_process').exec;
var gulp = require('gulp');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var _template = require('lodash.template');
var Server = require('karma').Server;
var path = require('path');

// -------------------------------------
//   Global Variables
// -------------------------------------

// Define release stages that will send errors to bugsnag
var notifyReleaseStages = "['live', 'qa']";

// If using a JSON file for the Google API secrets, uncomment the following line and search for
// "Google API" to find other lines to uncomment further below.

// const secrets_google_api_client_id = require('./secrets/google-api-client-id.json');

var srcPatterns = [
  'src/angular-app/**',
  'src/Api/**',
  'src/Site/**',
  'test/**'
];

var phpPatterns = [
  'src/angular-app/**/*.php',
  'src/Api/**/*.php',
  'src/Site/**/*.php',
  'test/**/*.php'
];

//region Test (PHP, JS, .NET, and E2E)

function runKarmaTests(applicationName, cb, type) {
  var config = {
    configFile: __dirname + '/karma.conf.js',
    applicationName: applicationName
  };

  switch (type) {
    case 'ci':
      config.reporters = 'teamcity';
      break;

    case 'watch':
      config.autoWatch = true;
      config.singleRun = false;
      break;

    case 'debug':
      config.autoWatch = true;
      config.singleRun = false;
      config.browsers = [];
      break;
  }

  new Server(config, function (err) {
    if (err === 0) {
      cb();
    } else {
      cb(new gutil.PluginError('karma', { message: 'Karma Tests failed' }));
    }
  }).start();
}

// -------------------------------------
//   Task: test-ts
// -------------------------------------
gulp.task('test-ts', function (cb) {
  var params = require('yargs')
    .option('applicationName', {
      demand: true,
      type: 'string' })
    .fail(yargFailure)
    .argv;
  runKarmaTests(params.applicationName, cb, 'ci');
});

// -------------------------------------
//   Task: test-ts-lf
// -------------------------------------
gulp.task('test-ts-lf', function (cb) {
  runKarmaTests('languageforge', cb);
});

// -------------------------------------
//   Task: test-ts-lf:watch
// -------------------------------------
gulp.task('test-ts-lf:watch', function (cb) {
  runKarmaTests('languageforge', cb, 'watch');
});

// -------------------------------------
//   Task: test-ts-lf:debug
// -------------------------------------
gulp.task('test-ts-lf:debug', function (cb) {
  runKarmaTests('languageforge', cb, 'debug');
});

//region build


// -------------------------------------
//   Task: Build Remove test fixtures (directives) in HTML only on live build
// -------------------------------------
gulp.task('build-remove-test-fixtures', function (done) {
  var params = require('yargs')
    .option('dest', {
      demand: false,
      default: 'root@localhost:/var/www/virtual/languageforge.org',
      type: 'string' })
    .fail(yargFailure)
    .argv;
  var base = './src/angular-app';
  var glob = path.join(base, '**/*.html');

  // only on live
  if (!params.dest.includes('/var/www/virtual/') &&
    (params.dest.endsWith('forge.org') || params.dest.endsWith('forge.org/'))) {
    return gulp.src(glob)
      .pipe(replace(/^.*<pui-mock-upload.*$/m, '\n'))
      .pipe(gulp.dest(base));
  } else {
    done();
  }
});

// -------------------------------------
//   Task: Build (Concat and ) Minify
// -------------------------------------
gulp.task('build-minify', function () {
  var params = require('yargs')
    .option('applicationName', {
      demand: true,
      type: 'string' })
    .option('doNoCompression', {
      demand: false,
      type: 'boolean' })
    .fail(yargFailure)
    .argv;
  var minifySrc = [
    'src/angular-app/bellows/**/*.js',
    'src/angular-app/container/**/*.js',
    'src/angular-app/' + params.applicationName + '/**/*.js',
    '!src/angular-app/**/*.min.js',
    '!src/angular-app/**/core/semantic-domains/**',
    '!src/angular-app/**/excluded/**',
    '!src/angular-app/**/vendor/**'];
  var minJsFile = params.applicationName + '.min.js';
  var dest = 'src/js/lib/';
  if (params.doNoCompression) {
    return gulp.src(minifySrc)
      .pipe(concat(minJsFile))
      .pipe(gulp.dest(dest));
  } else {
    return gulp.src(minifySrc)
      .pipe(concat(minJsFile))
      .pipe(uglify())
      .pipe(gulp.dest(dest));
  }
});

// -------------------------------------
//   Task: Build Version
// -------------------------------------
gulp.task('build-version', function () {
  var params = require('yargs')
    .option('buildNumber', {
      demand: true,
      type: 'string' })
    .fail(yargFailure)
    .argv;
  console.log('version =', params.buildNumber);
  return gulp.src('src/version.php')
    .pipe(replace(
      /^(define\('VERSION', ').*;$/m,
      '$1' + params.buildNumber + '\');'))
    .pipe(gulp.dest('src'));
});

// -------------------------------------
//   Task: Build Production Config
// -------------------------------------
gulp.task('build-productionConfig', function () {
  // Pass Google client ID and secret via environment variables so they don't show up in the build
  // logs
  var defaultMongodbConnection = 'db:27017';

  var googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (googleClientId === undefined) {
    googleClientId = 'googleClientId';
  }

  var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (googleClientSecret === undefined) {
    googleClientSecret = 'googleClientSecret';
  }

  var facebookClientId = process.env.FACEBOOK_CLIENT_ID;
  if (facebookClientId === undefined) {
    facebookClientId = 'facebookClientId';
  }

  var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET;
  if (facebookClientSecret === undefined) {
    facebookClientSecret = 'facebookClientSecret';
  }

  var languageDepotApiToken = process.env.LANGUAGE_DEPOT_API_TOKEN;
  if (languageDepotApiToken === undefined) {
    languageDepotApiToken = 'languageDepotApiToken';
  }

  var gatherWordsClientId = process.env.GATHERWORDS_CLIENT_ID;
  if (gatherWordsClientId === undefined) {
    gatherWordsClientId = 'gatherWordsClientId';
  }

  var bugsnagApiKey = process.env.XFORGE_BUGSNAG_API_KEY;
  if (bugsnagApiKey === undefined) {
    bugsnagApiKey = 'missing-bugsnag-api-key';
  }

  var params = require('yargs')
    .option('mongodbConnection', {
      demand: false,
      default: defaultMongodbConnection,
      type: 'string' })
    .option('secret', {
      demand: false,
      default: 'not_a_secret',
      type: 'string' })

    // If using a JSON file for the Google API secrets,
    // uncomment the "default: secrets_google_api_client_id.(name)" lines below.
    .option('googleClientId', {
      demand: false,

      // default: secrets_google_api_client_id.web.client_id,
      default: googleClientId,
      type: 'string' })
    .option('googleClientSecret', {
      demand: false,

      // default: secrets_google_api_client_id.web.client_secret,
      default: googleClientSecret,
      type: 'string' })
    .option('facebookClientId', {
      demand: false,
      default: facebookClientId,
      type: 'string' })
    .option('facebookClientSecret', {
      demand: false,
      default: facebookClientSecret,
      type: 'string' })
    .option('languageDepotApiToken', {
      demand: false,
      default: languageDepotApiToken,
      type: 'string' })
    .option('gatherWordsClientId', {
      demand: false,
      default: gatherWordsClientId,
      type: 'string' })
    .option('bugsnagApiKey', {
      demand: false,
      default: bugsnagApiKey,
      type: 'string' })
    .fail(yargFailure)
    .argv;
  var configSrc = [
    './src/config.php',
    './scripts/scriptsConfig.php',
    './test/php/TestConfig.php'];

  return gulp.src(configSrc, { base: './' })
    .pipe(replace(
      /(define\('ENVIRONMENT', ').*;$/m,
      '$1' + 'production\');'))
    .pipe(replace(
      defaultMongodbConnection,
      params.mongodbConnection))
    .pipe(replace(
      /(define\('REMEMBER_ME_SECRET', ').*;$/m,
      '$1' + params.secret + '\');'))
    .pipe(replace(
      /(define\('GOOGLE_CLIENT_ID', ').*;$/m,
      '$1' + params.googleClientId + '\');'))
    .pipe(replace(
      /(define\('GOOGLE_CLIENT_SECRET', ').*;$/m,
      '$1' + params.googleClientSecret + '\');'))
    .pipe(replace(
      /(define\('FACEBOOK_CLIENT_ID', ').*;$/m,
      '$1' + params.facebookClientId + '\');'))
    .pipe(replace(
      /(define\('FACEBOOK_CLIENT_SECRET', ').*;$/m,
      '$1' + params.facebookClientSecret + '\');'))
    .pipe(replace(
      /(define\('LANGUAGE_DEPOT_API_TOKEN', ').*;$/m,
      '$1' + params.languageDepotApiToken + '\');'))
    .pipe(replace(
      /(define\('GATHERWORDS_CLIENT_ID', ').*;$/m,
      '$1' + params.gatherWordsClientId + '\');'))
    .pipe(replace(
      /(define\('BUGSNAG_API_KEY', ').*;$/m,
      '$1' + params.bugsnagApiKey + '\');'))
    .pipe(replace(
      /(define\('BUGSNAG_NOTIFY_RELEASE_STAGES', ).*;$/m,
      '$1' + notifyReleaseStages + ');'))
    .pipe(gulp.dest('./'));
});

// -------------------------------------
//   Task: Build Upload to destination
// -------------------------------------
gulp.task('build-upload', function (cb) {
  var params = require('yargs')
    .option('dest', {
      demand: true,
      type: 'string' })
    .option('uploadCredentials', {
      demand: true,
      type: 'string' })
    .fail(yargFailure)
    .argv;
  var options = {
    dryRun: false,
    silent: false,
    includeFile: 'upload-include.txt',  // read include patterns from FILE
    excludeFile: 'upload-exclude.txt',  // read exclude patterns from FILE
    rsh: '--rsh="ssh -v -i ' + params.uploadCredentials + '"',
    src: 'src/',
    dest: path.join(params.dest, 'htdocs')
  };

  execute(
    'rsync -progzlt --chmod=Dug=rwx,Fug=rw,o-rwx ' +
    '--delete-during --stats --rsync-path="sudo rsync" <%= rsh %> ' +
    '--include-from="<%= includeFile %>" ' +
    '--exclude-from="<%= excludeFile %>" ' +
    '<%= src %> <%= dest %>',
    options,
    cb
  );

  // For E2E tests, upload test dir to destination
  if (params.dest.includes('e2etest')) {
    options.src = 'test/';
    options.dest = path.join(params.dest, '/test');

    execute(
      'rsync -progzlt --chmod=Dug=rwx,Fug=rw,o-rwx ' +
      '--delete-during --stats --rsync-path="sudo rsync" <%= rsh %> ' +
      '<%= src %> <%= dest %> --exclude php',
      options,
      cb
    );
  }
});


// -------------------------------------
//   Task: Build (General)
// -------------------------------------
// gulp.task('build',
//   gulp.series(
//     gulp.parallel(
//       'build-composer',
//       'build-npm-front-end',
//       'build-version',
//       'build-productionConfig',
//       'build-clearLocalCache',
//       'build-remove-test-fixtures',
//       // 'build-createWebsiteDefs'
//     ),
//     'sass',
//     'build-webpack',
//     'build-minify',
//     'build-changeGroup'
//   )
// );

// -------------------------------------
//   Task: Build and Upload to destination
// -------------------------------------
// gulp.task('build-and-upload',
//   gulp.series(
//     'build',
//     'build-upload',
//     'remote-restart-php-fpm'
//   )
// );

//endregion

// -------------------------------------
//   Task: default (build)
// -------------------------------------
// gulp.task('default', gulp.series('build'));

// -------------------------------------
//   Functions
// -------------------------------------
function execute(command, options, callback) {
  if (!options) {
    options = {};
  }

  options.maxBuffer = 1024 * 1000; // byte

  var template = _template(command);
  command = template(options);
  if (!options.silent) {
    gutil.log(gutil.colors.green(command));
  }

  if (!options.dryRun) {
    var process = _execute(command, options, callback || undefined);

    process.stdout.on('data', function (data) {
      gutil.log(stripTrailingLF(data));
    });

    process.stderr.on('data', function (data) {
      gutil.log(gutil.colors.yellow(stripTrailingLF(data)));
    });

  } else {
    callback(null);
  }
}

function stripTrailingLF (line) {
  return line[line.length-1] === '\n' ? line.slice(0, -1) : line;
}

// Determine the path to test/app from a given destination.
// Truncate the remote prefix of the destination
function getTestCwd(dest) {
  return (dest) ? path.join(dest.replace(/^(.)*:/, ''), 'test/app') : './test/app';
}

function yargFailure(msg, err, yargs) {
  if (err) {
    // preserve stack
    throw err;
  }

  console.error(msg);
  console.error('You should be doing', yargs.help());
  process.exit(1);
}
