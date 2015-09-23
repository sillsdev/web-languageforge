// npm install gulp gulp-util async gulp-livereload

var gulp = require('gulp');
var gutil = require('gulp-util');
var exec = require('child_process').exec;
var async = require('async');

// livereload
var livereload = require('gulp-livereload');

var reloadPatterns = [
  'src/**/*.php',
  'src/**/*.html',
  'src/**/*.css',
  'src/**/*.js',
  'src/**/*.twig',
  '!src/vendor*',
  'test/**/*.php',
  'test/**/*.js',
  'test/**/*.json',
  '!test/app/node_modules',
];

var execute = function(command, callback) {
  gutil.log(gutil.colors.green(command));
  exec(command, function(err, stdout, stderr) {
    gutil.log(stdout);
    gutil.log(gutil.colors.yellow(stderr));
    callback(err);
  });
};

gulp.task('default', function() {
  // place code for your default task here
});

gulp.task('do-reload', function() {
  return gulp.src('src/index.php').pipe(livereload());
});

gulp.task('reload', function() {
  livereload.listen();
  gulp.watch(reloadPatterns, ['do-reload']);
});

gulp.task('upload', function() {
  var options = {
    silent: false,
    src: 'htdocs',
    dest: 'root@saygoweb.com:/var/www/virtual/saygoweb.com/bms/htdocs/',
    key: '~/ssh/dev-cp-private.key',
  };
  gulp.src('htdocs').pipe(exec('rsync.exe -rzlt --chmod=Dug=rwx,Fug=rw,o-rwx --delete --exclude-from="upload-exclude.txt" --stats --rsync-path="sudo -u vu2006 rsync" --rsh="ssh -i <%= options.key %>" <%= options.src %>/ <%= options.dest %>', options));
});

gulp.task('test-php', function(cb) {
  execute('php test/php/languageforge/lexicon/AllTests.php', function(err) {
    cb(err);
  });
});

gulp.task('test-local', function(cb) {
  execute('php test/php/languageforge/lexicon/LiftImportFlex_Test.php', function(err) {
    cb(null);
  });
});

gulp.task('test-local-watch', function() {
  gulp.watch(['./src/Api/Model/**/*.php', './src/Api/Library/**/*.php', './test/php/languageforge/lexicon/**/*.php', '!./src/vendor/'], ['test-local']);
});

var coverageFolder = 'src/vendor/simpletest/simpletest/extensions/coverage/';
gulp.task('coverage-open', function(cb) {
  var options = {
    includes: [
      'src/Api/Library/.*\.php$',
      'src/Api/Model/.*\.php$',
    ],
    excludes: [
      'src/vendor/.*',
      'src/config/.*',
      'src/errors/.*',
      'src/helpers/.*',
      'lib/.*',
    ],
  };
  var args = '--';
  var command = function(commandName, args) {
    return 'php ' + coverageFolder + commandName + ' ' + args;
  };

  options.includes.forEach(function(regEx) {
    args = args + ' \\ \'--include=' + regEx + '\'';
  });

  options.excludes.forEach(function(regEx) {
    args = args + ' \\ \'--exclude=' + regEx + '\'';
  });

  execute(command('bin/php-coverage-open.php', args), function(err) {
    cb(err);
  });

});

gulp.task('coverage-close', function(cb) {
  var command = function(commandName, args) {
    return 'php ' + coverageFolder + commandName + ' ' + args;
  };

  async.series([
    function(callback) {
      execute(command('bin/php-coverage-close.php', ''), function(err) {
        callback(err);
      });
    },

    function(callback) {
      execute(command('bin/php-coverage-report.php', ''), function(err) {
        callback(err);
      });
    },
  ], function(err, results) {
    cb(err);
  });

});

gulp.task('backup-prod-db', function(cb) {
  execute('ssh scriptureforge.org \'bash -s\' < server/mongodb/backupMongoOnServer.sh', function(err) {
    cb(null);
  });
});

gulp.task('cleanup-backup-prod-db', ['backup-prod-db', 'copy-backup-to-local'], function(cb) {
  execute('ssh scriptureforge.org \'bash -s\' < server/mongodb/deleteTarFileOnServer.sh', function(err) {
    cb(null);
  });
});

gulp.task('copy-backup-to-local', ['backup-prod-db'], function(cb) {
  padLeft = function(i, len, ch) {
    var val = i.toString();
    while (val.length < len)
      val = ch + val;
    return val;
  };

  formatDateYMD = function(date) {
    return date.getFullYear() + '-' + padLeft(date.getMonth() + 1, 2, '0') + '-' + padLeft(date.getDate(), 2, '0');
  };

  var today = formatDateYMD(new Date());
  execute('scp scriptureforge.org:mongodb_backup_' + today + '.tgz /tmp/', function(err) {
    cb(null);
  });
});

gulp.task('restore-local-db', ['backup-prod-db', 'copy-backup-to-local'], function(cb) {
  // To set the username, edit your ssh config file (~/.ssh/config) and add an entry:
  // Host scriptureforge.org
  //     User jdoe
  execute('server/mongodb/restoreMongoOnLocal.sh /tmp', function(err) {
    cb(null);
  });
});

// Backup database on server and restore on local machine
gulp.task('copy-prod-db', ['backup-prod-db', 'cleanup-backup-prod-db', 'copy-backup-to-local', 'restore-local-db'], function(cb) {
  cb(null);
});

gulp.task('tasks', function(cb) {
  execute('grep gulp\.task gulpfile.js', function(err) {
    cb(null); // Swallow the error propagation so that gulp doesn't display a nodejs backtrace.
  });
});
