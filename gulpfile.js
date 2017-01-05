// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks:
//   'gulp'
//   'do-reload'
//   'reload'
//   'lint'
//   'generate-language-picker-assets'
//   'mongodb-backup-prod-db'
//   'mongodb-copy-backup-to-local'
//   'mongodb-cleanup-backup-prod-db'
//   'mongodb-restore-local-db'
//   'mongodb-copy-prod-db'
//   'test-php'
//   'test-php-debug'
//   'test-php-coverage'
//   'test-php-watch'
//   'test-php-debug-watch'
//   'test-js-unit'
//   'test-e2e-webdriver_update'
//   'test-e2e-webdriver_standalone'
//   'test-e2e-useTestConfig'
//   'test-e2e-useLiveConfig'
//   'test-e2e-setupTestEnvironment'
//   'test-e2e-teardownTestEnvironment'
//   'test-restart-webserver'
//   'test-e2e-env'
//   'test-e2e-doTest'
//   'test-e2e-run'
//   'build-composer'
//   'build-bower'
//   'build-remove-test-fixtures'
//   'build-minify'
//   'build-changeGroup'
//   'build-version'
//   'build-productionConfig'
//   'build-clearLocalCache'
//   'build-upload'
//   'build'
//   'build-and-upload'
//   'build-e2e'
//   'build-php'
//   'markdown'
//   'default'
//   'sass',
//   'sass:watch'

// -------------------------------------
//   Modules
// -------------------------------------
//
// es6-shim          : ECMAScript 6 (Harmony) compatibility for legacy JavaScript engines
// async             : Higher-order functions and common patterns for asynchronous code
// child_process     : Call a child process with the ease of exec and safety of spawn
// gulp              : The streaming build system
// gulp-concat       : Concatenates files
// gulp-jshint       : JSHint plugin for gulp
// gulp-livereload   : Gulp plugin for livereload
// gulp-markdown     : Markdown to HTML
// gulp-phpunit      : PHPUnit plugin for Gulp
// gulp-protractor   : A helper for protactor and gulp
// gulp-rename       : Rename files
// gulp-replace      : A string replace plugin for gulp
// gulp-sass         : Sass plugin for Gulp
// gulp-uglify       : Minify files with UglifyJS
// gulp-util         : Utility functions for gulp plugins
// lodash.template   : The lodash method `_.template` exported as a module
// karma             : Spectacular Test Runner for JavaScript
// jshint-stylish    : Stylish reporter for JSHint
// path              : Node.JS path module
// yargs             : yargs the modern, pirate-themed, successor to optimist
require('es6-shim');
var async = require('async');
var _execute = require('child_process').exec;
var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var markdown = require('gulp-markdown');
var phpunit = require('gulp-phpunit');
var protractor = require('gulp-protractor').protractor;
var webdriverStandalone = require('gulp-protractor').webdriver_standalone;
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var _template = require('lodash.template');
var Server = require('karma').Server;
var path = require('path');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');

var execute = function (command, options, callback) {
  if (options == undefined) {
    options = {};
  }

  options.maxBuffer = 1024 * 1000; // byte

  var template = _template(command);
  command = template(options);
  if (!options.silent) {
    gutil.log(gutil.colors.green(command));
  }

  if (!options.dryRun) {
    _execute(command, options, function (err, stdout, stderr) {
      gutil.log(stdout);
      gutil.log(gutil.colors.yellow(stderr));
      callback(err);
    });
  } else {
    callback(null);
  }
};

// Determine the path to test/app from a given destination.
// Truncate the remote prefix of the destination
function getTestCwd(dest) {
  return (dest) ? path.join(dest.replace(/^(.)*:/, ''), 'test/app') : './test/app';
}

// Globals
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

// -------------------------------------
//   Task: Do Reload
// -------------------------------------
gulp.task('do-reload', function () {
  return gulp.src('src/index.php').pipe(livereload());
});

// -------------------------------------
//   Task: Reload
// -------------------------------------
gulp.task('reload', function () {
  livereload.listen();
  gulp.watch(srcPatterns, gulp.series('do-reload'));
});

// -------------------------------------
//   Task: Lint
// -------------------------------------
gulp.task('lint', function () {
  return gulp.src(srcPatterns)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

// -------------------------------------
//   Task: Auto-generate language picker asset files
// -------------------------------------
gulp.task('generate-language-picker-assets', function (cb) {

  // Manual prerequisite:
  // copy from libpalaso:palaso-trusty64-master/SIL.WritingSystems/Resources/*.txt
  // into scripts/language picker/

  var options = {
    dryRun: false,
    silent: false,
    cwd: './scripts/language picker/'
  };

  // auto-generated files written to src/angular-app/bellows/js/assets/
  execute(
    './build-json-language-data.py',
    options,
    cb
  );
});

gulp.task('generate-language-picker-assets').description =
  'Update asset files used for language picker';

//region MongoDB

// -------------------------------------
//   Task: MongoDB: Backup Production
// -------------------------------------
gulp.task('mongodb-backup-prod-db', function (cb) {
  execute(
    'ssh scriptureforge.org \'bash -s\' < scripts/server/mongodb/backupMongoOnServer.sh',
    null,
    cb
  );
});

// -------------------------------------
//   Task: MongoDB: Copy Backup to Local
// -------------------------------------
gulp.task('mongodb-copy-backup-to-local', function (cb) {
  var padLeft = function (i, len, ch) {
    var val = i.toString();
    while (val.length < len)
      val = ch + val;
    return val;
  };

  var formatDateYMD = function (date) {
    return date.getFullYear() + '-' + padLeft(date.getMonth() + 1, 2, '0') + '-' +
        padLeft(date.getDate(), 2, '0');
  };

  var today = formatDateYMD(new Date());
  execute(
    'scp scriptureforge.org:mongodb_backup_' + today + '.tgz /tmp/',
    null,
    cb
  );
});

// -------------------------------------
//   Task: MongoDB: Clean Backup Production
// -------------------------------------
gulp.task('mongodb-cleanup-backup-prod-db', function (cb) {
  // To set the username, edit your ssh config file (~/.ssh/config) and add an entry:
  // Host scriptureforge.org
  //     User jdoe
  execute(
    'ssh scriptureforge.org \'bash -s\' < scripts/server/mongodb/deleteTarFileOnServer.sh',
    null,
    cb
  );
});

// -------------------------------------
//   Task: MongoDB: Restore Mongo on Local
// -------------------------------------
gulp.task('mongodb-restore-local-db', function (cb) {
  execute(
    'scripts/server/mongodb/restoreMongoOnLocal.sh /tmp',
    null,
    cb
  );
});

gulp.task('mongodb-restore-local-db').description =
  'Restore mongodb from a local archive file';

// -------------------------------------
//   Task: MongoDB: Copy Production
// -------------------------------------
gulp.task('mongodb-copy-prod-db',
  gulp.series(
    'mongodb-backup-prod-db',
    'mongodb-copy-backup-to-local',
    gulp.parallel('mongodb-cleanup-backup-prod-db', 'mongodb-restore-local-db')
  )
);
gulp.task('mongodb-copy-prod-db').description =
  'Backup MongoDB on server and restore on local machine';

//endregion

//region Test (PHP and E2E)

// -------------------------------------
//   Task: test-php
// -------------------------------------
gulp.task('test-php', function (cb) {
  var src = 'test/php/phpunit.xml';
  var options = {
    dryRun: false,
    debug: false,
    logJunit: 'PhpUnitTests.xml'
  };
  gutil.log("##teamcity[importData type='junit' path='PhpUnitTests.xml']");
  execute(
    '/usr/bin/env php src/vendor/phpunit/phpunit/phpunit -c test/php/phpunit.xml',
    options,
    cb
  );

  // return gulp.src(src)
  //   .pipe(phpunit('src/vendor/bin/phpunit', options));
});

// -------------------------------------
//   Task: test-php with debugging info
// -------------------------------------
gulp.task('test-php-debug', function () {
  var src = 'test/php/phpunit.xml';
  var options = {
    dryRun: false,
    debug: true
  };
  return gulp.src(src)
    .pipe(phpunit('src/vendor/bin/phpunit', options));
});

// -------------------------------------
//   Task: test-php-coverage
// -------------------------------------
gulp.task('test-php-coverage', function () {
  var src = 'test/php/phpunit.xml';
  var options = {
    dryRun: false,
    debug: false,
    logJunit: 'PhpUnitTests.xml',
    coverageHtml: 'test/CodeCoverage/php/'
  };
  gutil.log("##teamcity[importData type='junit' path='PhpUnitTests.xml']");
  return gulp.src(src)
    .pipe(phpunit('src/vendor/bin/phpunit', options));
});

// -------------------------------------
//   Task: test-php-watch
// -------------------------------------
gulp.task('test-php-watch', function () {
  gulp.watch(phpPatterns, ['test-php']);
});

// -------------------------------------
//   Task: test-php-watch with debugging info
// -------------------------------------
gulp.task('test-php-debug-watch', function () {
  gulp.watch(phpPatterns, ['test-php-debug']);
});

// -------------------------------------
//   Task: test-js-unit
// -------------------------------------
gulp.task('test-js-unit', function (cb) {
  console.log('cwd: ', __dirname);
  new Server({
    configFile: __dirname + '/test/app/karma.conf.js',
    reporters: 'teamcity',
    singleRun: true
  }, cb).start();
});

// -------------------------------------
//   Task: E2E Test: Webdriver Update
// -------------------------------------
gulp.task('test-e2e-webdriver_update', webdriverUpdate);

// -------------------------------------
//   Task: E2E Test: Webdriver Standalone
// -------------------------------------
gulp.task('test-e2e-webdriver_standalone', webdriverStandalone);

function copy(src, dest) {
  return gulp.src(src)
    .pipe(rename(dest.file))
    .pipe(gulp.dest(dest.path));
}

// -------------------------------------
//   Task: E2E Test: Use Test Config
// -------------------------------------
gulp.task('test-e2e-useTestConfig', function () {
  var src = 'src/config.php.fortest';
  var dest = {
    file: 'config.php',
    path: 'src/' };
  return copy(src, dest);
});

// -------------------------------------
//   Task: E2E Test: Use Live Config
// -------------------------------------
gulp.task('test-e2e-useLiveConfig', function () {
  var src = 'src/config.php.live';
  var dest = {
    file: 'config.php',
    path: 'src/' };
  return copy(src, dest);
});

// -------------------------------------
//   Task: E2E Test: Setup Test Environment
// -------------------------------------
gulp.task('test-e2e-setupTestEnvironment', function (cb) {
  var params = require('yargs')
    .option('webserverHost', {
      demand: true,
      describe: 'hostname (without the protocol) for E2E testing',
      type: 'string' })
    .option('dest', {
      demand: false,
      describe: 'destination of test environment',
      type: 'string' })
    .argv;
  var options = {
    dryRun: false,
    silent: false,
    cwd: getTestCwd(params.dest)
  };
  execute(
    'sudo -u www-data php setupTestEnvironment.php ' + params.webserverHost,
    options,
    cb
  );
});

// -------------------------------------
//   Task: E2E Test: Teardown Test Environment
// -------------------------------------
gulp.task('test-e2e-teardownTestEnvironment', function (cb) {
  var params = require('yargs')
    .option('dest', {
      demand: false,
      describe: 'destination of test environment',
      type: 'string' })
    .argv;
  var options = {
    dryRun: false,
    silent: false,
    cwd: getTestCwd(params.dest)
  };
  execute(
    'sudo -u www-data php teardownTestEnvironment.php',
    options,
    cb
  );
});

// -------------------------------------
//   Task: Test Restart Webserver
// -------------------------------------
gulp.task('test-restart-webserver', function (cb) {
  execute(
    'sudo service apache2 restart',
    null,
    cb
  );
});

// -------------------------------------
//   Task: E2E Test: Modify Environment
// -------------------------------------
gulp.task('test-e2e-env', function () {
  var params = require('yargs')
    .option('applicationName', {
      demand: true,
      type: 'string' })
    .option('dest', {
      demand: false,
      type: 'string' })
    .option('webserverHost', {
      demand: false,
      default: 'languageforge.local',
      type: 'string' })
    .argv;
  var cwd = getTestCwd(params.dest);
  var src = [
    'setupTestEnvironment.php',
    'teardownTestEnvironment.php',
    'e2eTestConfig.php',
    'testConstants.json'];

  return gulp.src(src, { cwd: cwd })

    // e2eTestConfig.php
    .pipe(replace('src/', 'htdocs/'))

    // testConstants.json
    .pipe(replace(
      /(\s*\"siteType\"\s*:\s*\").*$/m,
      '$1' + params.applicationName + '",'))
    .pipe(replace(
      /(\s*\"siteHostname\"\s*:\s*\").*$/m,
      '$1' + params.webserverHost + '",'))
    .pipe(replace(
      /(\s*\"baseUrl\"\s*:\s*\").*$/m,
      '$1http://' + params.webserverHost + '",'))
    .pipe(gulp.dest(cwd));
});

// -------------------------------------
//   Task: E2E Test: Do Test
// -------------------------------------
gulp.task('test-e2e-doTest', function (cb) {
  var params = require('yargs')
    .usage(
      'Usage: $0 test-e2e-doTest --webserverHost [hostname] --specs [testSpecs] ' +
      '--seleniumAddress [address] --verbosity [bool]')
    .option('webserverHost', {
      demand: true,
      describe: 'hostname (without the protocol) for E2E testing',
      type: 'string' })
    .option('specs', {
      demand: false,
      describe: 'testSpecs are the names of the e2e test specs to run',
      type: 'string' })
    .option('seleniumAddress', {
      demand: false,
      describe: 'address of a running selenium server. default http://default.local:4444/wd/hub',
      type: 'string' })
    .option('verbosity', {
      demand: false,
      describe: 'bool for jasmine reporter verbosity.  true for more detail',
      type: 'boolean' })
    .help('?')
    .alias('?', 'help')
    .example('$0 test-e2e-run --webserverHost languageforge.local',
      'Runs all the E2E tests for languageforge')
    .example('$0 test-e2e-run --webserverHost scriptureforge.local --specs projectSettingsPage',
      'Runs the scriptureforge E2E test for projectSettingsPage')
    .argv;

  var protocol =
    (params.webserverHost == 'jamaicanpsalms.scriptureforge.local') ? 'https://' : 'http://';

  // vars for configuring protractor
  var protractorOptions = {
    configFile: './test/app/protractorConf.js',
    args: ['--baseUrl', protocol + params.webserverHost],
    debug: false
  };

  // Generate list of specs to test (glob format so protractor will test whatever files exist)
  var specString = (params.specs) ? params.specs : '*';
  var specs = [
    'test/app/allspecs/e2e/*.spec.js',
    'test/app/bellows/**/e2e/' + specString + '.spec.js'];
  if (params.webserverHost.includes('languageforge')) {
    specs.push('test/app/languageforge/**/e2e/' + specString + '.spec.js');
  } else {
    specs.push('test/app/scriptureforge/**/e2e/' + specString + '.spec.js');
  }

  // Get the selenium server address
  if (params.seleniumAddress && params.seleniumAddress.length > 0) {
    protractorOptions.args.push('--seleniumAddress', params.seleniumAddress);
  }

  if (params.verbosity) {
    protractorOptions.args.push('--params.verbosity', 3);
  } else {
    protractorOptions.args.push('--params.verbosity', 0);
  }

  // It's better to pass the specs array of files to test, and not use the --exclude parameter
  console.log('specs: ', specs);
  return gulp.src(specs)
    .pipe(protractor(protractorOptions))
    .on('error', function (e) {
      console.log(e);
      throw e;
    })
    .on('end', cb);
});

// -------------------------------------
//   Task: E2E Test: Run
// -------------------------------------
gulp.task('test-e2e-run',
  gulp.series(
    'test-e2e-useTestConfig',
    'test-restart-webserver',
    'test-e2e-setupTestEnvironment',
    'test-e2e-doTest')
);
gulp.task('test-e2e-run').description = 'Run the E2E test on local developer environment';

//endregion

//region build

// -------------------------------------
//   Task: Build Composer
// -------------------------------------
gulp.task('build-composer', function (cb) {
  var options = {
    dryRun: false,
    silent: false,
    cwd: './src'
  };
  execute(
    'composer install',
    options,
    cb
  );
});

// -------------------------------------
//   Task: Build Bower
// -------------------------------------
gulp.task('build-bower', function (cb) {
  var options = {
    dryRun: false,
    silent: false,
    cwd: './src'
  };
  execute(
    'bower install',
    options,
    cb
  );
});

// -------------------------------------
//   Task: Build Remove test fixtures (directives) in HTML only on live build
// -------------------------------------
gulp.task('build-remove-test-fixtures', function (done) {
  var params = require('yargs')
    .option('dest', {
      demand: false,
      default: 'root@localhost:/var/www/virtual/languageforge.org',
      type: 'string' })
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
    .argv;
  var minifySrc = [
    'src/angular-app/bellows/**/*.js',
    'src/angular-app/container/**/*.js',
    'src/angular-app/' + params.applicationName + '/**/*.js',
    '!src/angular-app/**/*.min.js',
    '!src/angular-app/**/assets/**',
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
    .argv;
  console.log('version =', params.buildNumber);
  return gulp.src('src/version.php')
    .pipe(replace(
      /^(define\('VERSION', ').*;$/m,
      '$1' + params.buildNumber + '\');'))
    .pipe(gulp.dest('src'));
});

// -------------------------------------
//   Task: Change Group to www-data
// -------------------------------------
gulp.task('build-changeGroup', function (cb) {
  execute(
    'sudo chgrp -R www-data src; sudo chgrp -R www-data test; ' +
    'sudo chmod -R g+w src; sudo chmod -R g+w test',
    null,
    cb
  );
});

gulp.task('build-changeGroup').description =
  'Ensure www-data is the group and can write for src and test folder';

// -------------------------------------
//   Task: Build Production Config
// -------------------------------------
gulp.task('build-productionConfig', function () {
  var defaultMongodbConnection = 'localhost:27017';
  var params = require('yargs')
    .option('mongodbConnection', {
      demand: false,
      default: defaultMongodbConnection,
      type: 'string' })
    .option('secret', {
      demand: false,
      default: 'not_a_secret',
      type: 'string' })
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
    .pipe(gulp.dest('./'));
});

// -------------------------------------
//   Task: Build Clear Local Cache
// -------------------------------------
gulp.task('build-clearLocalCache', function (cb) {
  var options = {
    dryRun: false,
    silent: false,
    cwd: 'src/cache/'
  };
  execute(
    'git clean -d -x -f',
    options,
    cb
  );
});

gulp.task('build-clearLocalCache').description =
  'Clear all subdirectories of local cache/';

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
    options.src = 'test/app/';
    options.dest = path.join(params.dest, '/test/app');

    execute(
      'rsync -progzlt --chmod=Dug=rwx,Fug=rw,o-rwx ' +
      '--delete-during --stats --rsync-path="sudo rsync" <%= rsh %> ' +
      '<%= src %> <%= dest %>',
      options,
      cb
    );
  }
});

// -------------------------------------
//   Task: Build (General)
// -------------------------------------
gulp.task('build',
  gulp.series(
    gulp.parallel(
      'build-composer',
      'build-bower',
      'build-version',
      'build-productionConfig',
      'build-clearLocalCache',
      'build-remove-test-fixtures'),
    'build-minify',
    'build-changeGroup')
);

// -------------------------------------
//   Task: Build and Upload to destination
// -------------------------------------
gulp.task('build-and-upload',
  gulp.series(
    'build',
    'build-upload',
    'test-restart-webserver')
);

// -------------------------------------
//   Task: Build E2E Target
// -------------------------------------
gulp.task('build-e2e',
  gulp.series(
    'test-e2e-useTestConfig',
    'build-and-upload',
    'test-e2e-env',
    'test-e2e-setupTestEnvironment',
    'test-e2e-doTest'
  )
);
gulp.task('build-e2e').description =
  'Build and Run E2E tests on CI server';

// -------------------------------------
//   Task: Build, PHP Tests, Upload
// -------------------------------------
gulp.task('build-php',
  gulp.series(
    'build',
    'test-php-coverage',
    'build-upload',
    'test-restart-webserver')
);
gulp.task('build-php').description =
  'Build and Run PHP tests on CI server; Deploy to dev site';

//endregion

// -------------------------------------
//   Task: Markdown
// -------------------------------------
gulp.task('markdown', function () {
  return gulp.src('src/angular-app/**/helps/**/*.md')
    .pipe(markdown())
    .pipe(gulp.dest('src/angular-app'));
});

gulp.task('markdown').description = 'Generate helps markdown files';

// -------------------------------------
//   Task: Display Tasks
// gulp -T                 Print the task dependency tree
// gulp --tasks-simple     Print a list of gulp task names
// -------------------------------------

gulp.task('default', gulp.series('build'));


// -------------------------------------
//   Task: Compile all the sass files into a single css file
// -------------------------------------
gulp.task('sass:base', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/base/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/Site/views/languageforge/theme/default/cssBootstrap4/'));
});

gulp.task('sass:activity', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/activity/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/activity/bootstrap4/'));
});

gulp.task('sass:changepassword', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/changepassword/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/changepassword/bootstrap4/'));
});

gulp.task('sass:forgot_password', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/forgot_password/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/forgot_password/bootstrap4/'));
});

gulp.task('sass:home', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/home/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/Site/views/languageforge/theme/default/page/home/bootstrap4/'));
});

gulp.task('sass:lexicon', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/lexicon/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/languageforge/lexicon/bootstrap4/'));
});

gulp.task('sass:login', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/login/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/login/bootstrap4/'));
});

gulp.task('sass:registration', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/registration/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/registration/bootstrap4/'));
});

gulp.task('sass:new-project', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/new-project/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/languageforge/lexicon/new-project/bootstrap4/'));
});

gulp.task('sass:projects', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/projects/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/projects/bootstrap4/'));
});

gulp.task('sass:reset_password', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/reset_password/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/reset_password/bootstrap4/'));
});

gulp.task('sass:signup', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/rsignup/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/public/signup/bootstrap4/'));
});

gulp.task('sass:siteadmin', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/siteadmin/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/siteadmin/bootstrap4/'));
});

gulp.task('sass:usermanagement', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/usermanagement/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/usermanagement/bootstrap4'));
});

gulp.task('sass:terms_and_conditions', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/terms_and_conditions/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/Site/views/shared/cssBootstrap4/'));
});

gulp.task('sass:userprofile', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/userprofile/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/userprofile/bootstrap4/'));
});

gulp.task('sass:registration', function () {
  return gulp.src('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/userprofile/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/angular-app/bellows/apps/userprofile/bootstrap4/'));
});
// -------------------------------------
//   Task: Watch the primary sass folder for any changes and recompile via the sass task
// -------------------------------------
gulp.task('sass:watch', function () {
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/base/*.scss', gulp.series('sass:base'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/activity/*.scss', gulp.series('sass:activity'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/changepassword/*.scss', gulp.series('sass:changepassword'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/forgot_password/*.scss', gulp.series('sass:forgot_password'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/home/*.scss', gulp.series('sass:home'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/lexicon/*.scss', gulp.series('sass:lexicon'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/login/*.scss', gulp.series('sass:login'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/new-project/*.scss', gulp.series('sass:new-project'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/projects/*.scss', gulp.series('sass:projects'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/reset_password/*.scss', gulp.series('sass:reset_password'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/registration/*.scss', gulp.series('sass:registration'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/signup/*.scss', gulp.series('sass:signup'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/siteadmin/*.scss', gulp.series('sass:siteadmin'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/terms_and_conditions/*.scss', gulp.series('sass:terms_and_conditions'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/usermanagement/*.scss', gulp.series('sass:usermanagement'));
  gulp.watch('src/Site/views/languageforge/theme/default/cssBootstrap4/sass/userprofile/*.scss', gulp.series('sass:userprofile'));

});
