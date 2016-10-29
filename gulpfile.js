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
//   'upload'
//   'mongodb-backup-prod-db'
//   'mongodb-copy-backup-to-local'
//   'mongodb-cleanup-backup-prod-db'
//   'mongodb-restore-local-db'
//   'mongodb-copy-prod-db'
//   'test-php'
//   'test-php-coverage-open'
//   'test-php-coverage-close'
//   'test-js-unit'
//   'test-e2e-webdriver_update'
//   'test-e2e-webdriver_standalone'
//   'test-e2e-parseArgs'
//   'test-e2e-useTestConfig'
//   'test-e2e-useLiveConfig'
//   'test-e2e-setupTestEnvironment'
//   'test-e2e-teardownTestEnvironment'
//   'test-e2e-doTest'
//   'test-e2e-run'
//   'tasks'
//   'default'

// -------------------------------------
//   Modules
// -------------------------------------
//
// async             : Higher-order functions and common patterns for asynchronous code
// exec              : Call a child process with the ease of exec and safety of spawn
// gulp              : The streaming build system
// gulp-jshint       : JSHint plugin for gulp
// gulp-livereload   : Gulp plugin for livereload
// gulp-markdown     : Markdown to HTML
// gulp-protractor   : A helper for protactor and gulp
// gulp-util         : Utility functions for gulp plugins
// karma             : Spectacular Test Runner for JavaScript
// sylish            : Stylish reporter for JSHint
// yargs             : yargs the modern, pirate-themed, successor to optimist
var async = require('async');
var exec = require('child_process').exec;
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var livereload = require('gulp-livereload');
var markdown = require('gulp-markdown');
var protractor = require('gulp-protractor').protractor;
var webdriverStandalone = require('gulp-protractor').webdriver_standalone;
var webdriverUpdate = require('gulp-protractor').webdriver_update;
var gutil = require('gulp-util');
var Server = require('karma').Server;
var stylish = require('jshint-stylish');

var execute = function (command, callback) {
  gutil.log(gutil.colors.green(command));
  exec(command, function (err, stdout, stderr) {
    gutil.log(stdout);
    gutil.log(gutil.colors.yellow(stderr));
    callback(err);
  });
};

var srcPatterns = [
  'src/angular-app/**',
  'src/Api/**',
  'src/Site/**',
  'test/**'
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
//   Task: Upload
// -------------------------------------
gulp.task('upload', function () {
  var options = {
    silent: false,
    src: 'htdocs',
    dest: 'root@saygoweb.com:/var/www/virtual/saygoweb.com/bms/htdocs/',
    key: '~/ssh/dev-cp-private.key'
  };
  gulp.src('htdocs').pipe(exec('rsync.exe -rzlt --chmod=Dug=rwx,Fug=rw,o-rwx --delete ' +
    '--exclude-from="upload-exclude.txt" --stats --rsync-path="sudo -u vu2006 rsync" ' +
    '--rsh="ssh -i <%= options.key %>" <%= options.src %>/ <%= options.dest %>', options));
});

//region MongoDB

// -------------------------------------
//   Task: MongoDB: Backup Production
// -------------------------------------
gulp.task('mongodb-backup-prod-db', function (cb) {
  execute('ssh scriptureforge.org \'bash -s\' < scripts/server/mongodb/backupMongoOnServer.sh',
      function () {
        cb(null);
      });
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
  execute('scp scriptureforge.org:mongodb_backup_' + today + '.tgz /tmp/', function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: MongoDB: Clean Backup Production
// -------------------------------------
gulp.task('mongodb-cleanup-backup-prod-db', function (cb) {
  execute('ssh scriptureforge.org \'bash -s\' < scripts/server/mongodb/deleteTarFileOnServer.sh',
      function () {
        cb(null);
      });
});

// -------------------------------------
//   Task: MongoDB: Restore Mongo on Local
// -------------------------------------
gulp.task('mongodb-restore-local-db', function (cb) {
  // To set the username, edit your ssh config file (~/.ssh/config) and add an entry:
  // Host scriptureforge.org
  //     User jdoe
  execute('scripts/server/mongodb/restoreMongoOnLocal.sh /tmp', function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: MongoDB: Copy Production (Backup MongoDB on server and restore on local machine)
// -------------------------------------
gulp.task('mongodb-copy-prod-db',
    gulp.series(
        'mongodb-backup-prod-db',
        'mongodb-copy-backup-to-local',
        gulp.parallel('mongodb-cleanup-backup-prod-db', 'mongodb-restore-local-db')
    )
);

//endregion

//region PHPTests

// -------------------------------------
//   Task: test-php
// -------------------------------------
gulp.task('test-php', function (cb) {
  execute('php test/php/languageforge/lexicon/AllTests.php', function (err) {
    cb(err);
  });
});

// -------------------------------------
//   Task: test-php-coverage-open
// -------------------------------------
gulp.task('test-php-coverage-open', function (cb) {
  var options = {
    includes: [
      'src/Api/Library/.*\.php$',
      'src/Api/Model/.*\.php$'
    ],
    excludes: [
      'src/vendor/.*',
      'src/config/.*',
      'src/errors/.*',
      'src/helpers/.*',
      'lib/.*'
    ]
  };
  var coverageFolder = 'src/vendor/simpletest/simpletest/extensions/coverage/';
  var args = '--';
  var command = function (commandName, args) {
    return 'php ' + coverageFolder + commandName + ' ' + args;
  };

  options.includes.forEach(function (regEx) {
    args = args + ' \\ \'--include=' + regEx + '\'';
  });

  options.excludes.forEach(function (regEx) {
    args = args + ' \\ \'--exclude=' + regEx + '\'';
  });

  execute(command('bin/php-coverage-open.php', args), function (err) {
    cb(err);
  });

});

// -------------------------------------
//   Task: test-php-coverage-close
// -------------------------------------
gulp.task('test-php-coverage-close', function (cb) {
  var command = function (commandName, args) {
    return 'php ' + coverageFolder + commandName + ' ' + args;
  };

  async.series([
    function (callback) {
      execute(command('bin/php-coverage-close.php', ''), function (err) {
        callback(err);
      });
    },

    function (callback) {
      execute(command('bin/php-coverage-report.php', ''), function (err) {
        callback(err);
      });
    }
  ], function (err) {
    cb(err);
  });

});

//endregion

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

//region E2ETest

// Global vars for configuring protractor
var protractorOptions = {
  configFile: './test/app/protractorConf.js',
  args: [],
  debug: false
};
var hostname = '';

// list of specs to test.  More specs added in later tasks
var specs = ['test/app/allspecs/e2e/*.spec.js'];

// -------------------------------------
//   Task: E2E Test: Webdriver Update
// -------------------------------------
gulp.task('test-e2e-webdriver_update', webdriverUpdate);

// -------------------------------------
//   Task: E2E Test: Webdriver Standalone
// -------------------------------------
gulp.task('test-e2e-webdriver_standalone', webdriverStandalone);

// -------------------------------------
//   Task: E2E Test: Parse Args
// -------------------------------------
gulp.task('test-e2e-parseArgs', function (cb) {
  var options = require('yargs')
      .usage(
        'Usage: $0 test-e2e-parseArgs --hostname [hostname] ' +
        '--specs [testSpecs] --seleniumAddress [address] --verbosity [bool]')
      .option('hostname', {
        demand: true,
        describe: "local hostname is 'languageforge.local' or " +
          "'scriptureforge.local' or 'jamaicanpsalms.scriptureforge.local'",
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
      .example('$0 test-e2e-parseArgs --hostname languageforge.local',
        'Runs all the E2E tests for languageforge')
      .example('$0 test-e2e-parseArgs --hostname scriptureforge.local --specs projectSettingsPage',
        'Runs the scriptureforge E2E test for projectSettingsPage').argv;

  // Get the hostname from the first parameter
  if (options.hostname && options.hostname.length > 0) {
    hostname = options.hostname.toLowerCase();
    if (hostname == 'jamaicanpsalms.scriptureforge.local') {
      protractorOptions.args.push('--baseUrl', 'https://' + hostname);
    } else {
      protractorOptions.args.push('--baseUrl', 'http://' + hostname);
    }
  } else {
    console.log('Failed to provide a valid hostname.  Exiting');
    process.exit(-1);
  }

  // Generate list of specs to test (glob format so protractor will test whatever files exist)
  var specString = ((options.specs) && (options.specs.length > 0)) ? options.specs : '*';
  if (hostname.includes('languageforge')) {
    specs.push('test/app/bellows/**/e2e/' + specString + '.spec.js',
      'test/app/languageforge/**/e2e/' + specString + '.spec.js');
  } else {
    specs.push('test/app/bellows/**/e2e/' + specString + '.spec.js',
      'test/app/scriptureforge/**/e2e/' + specString + '.spec.js');
  }

  // Get the selenium server address
  if (options.seleniumAddress && options.seleniumAddress.length > 0) {
    protractorOptions.args.push('--seleniumAddress', options.seleniumAddress);
  }

  if (options.verbosity) {
    protractorOptions.args.push('--params.verbosity', 3);
  } else {
    protractorOptions.args.push('--params.verbosity', 0);
  }

  cb(null);
});

// -------------------------------------
//   Task: E2E Test: Use Test Config
// -------------------------------------
gulp.task('test-e2e-useTestConfig', function (cb) {
  execute('cp ./src/config.php.fortest ./src/config.php', function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: E2E Test: Use Live Config
// -------------------------------------
gulp.task('test-e2e-useLiveConfig', function (cb) {
  execute('cp ./src/config.php.live ./src/config.php', function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: E2E Test: Setup Test Environment
// -------------------------------------
gulp.task('test-e2e-setupTestEnvironment', function (cb) {
  execute('sudo -u www-data php ./test/app/setupTestEnvironment.php ' + hostname, function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: E2E Test: Teardown Test Environment
// -------------------------------------
gulp.task('test-e2e-teardownTestEnvironment', function (cb) {
  execute('sudo -u www-data php ./test/app/teardownTestEnvironment.php', function () {
    cb(null);
  });
});

// -------------------------------------
//   Task: E2E Test: Do Test
// -------------------------------------
gulp.task('test-e2e-doTest', function (cb) {
  // It's better to pass the specs array of files to test, and not use the --exclude parameter
  console.log('specs: ', specs);
  gulp.src(specs)
    .pipe(protractor(protractorOptions))

    // error handling
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
    'test-e2e-parseArgs',
    'test-e2e-useTestConfig',
    'test-e2e-setupTestEnvironment',
    'test-e2e-doTest',
    function (cb) {
      cb(null);
    }
  )
);
gulp.task('test-e2e-run').description = 'Run the E2E test';

//endregion

gulp.task('tasks', function (cb) {
  execute('grep gulp\.task gulpfile.js', function () {
    cb(null); // Swallow the error propagation so that gulp doesn't display a nodejs backtrace.
  });
});

gulp.task('default', function () {
  return gulp.src('src/angular-app/**/helps/**/*.md').pipe(markdown())
    .pipe(gulp.dest('src/angular-app'));

  // place code for your default task here
});

gulp.task('default').description = 'Generate helps markdown files';

