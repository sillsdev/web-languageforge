var gulp = require('gulp');
var gutil = require('gulp-util');
var exec = require('child_process').exec;
var async = require('async');

// livereload
var livereload = require('gulp-livereload');
var lr = require('tiny-lr');
var server = lr();

var srcTheme = [];

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
  return gulp.src('src/index.php').pipe(livereload(server));
});

gulp.task('reload', function() {
  server.listen(35729, function(err) {
    if (err) {
      return console.log(err);
    }
    gulp.watch(srcTheme, ['do-reload']);
  });
});

gulp.task('upload', function() {
  var options = {
    silent : false,
    src : "htdocs",
    dest : "root@saygoweb.com:/var/www/virtual/saygoweb.com/bms/htdocs/",
    key : "~/ssh/dev-cp-private.key"
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
  gulp.watch(["./src/models/**/*.php", "./src/libraries/**/*.php", "./test/php/languageforge/lexicon/**/*.php", "!./src/vendor/"], ['test-local']);
})

var coverageFolder = 'src/vendor/simpletest/simpletest/extensions/coverage/';
gulp.task('coverage-open', function(cb) {
  var options = {
      includes: [
        'src/libraries/.*\.php$',
        'src/models/.*\.php$'
      ],
      excludes: [
        'src/vendor/.*',
        'src/config/.*',
        'src/errors/.*',
        'src/helpers/.*',
        'lib/.*'
      ]
  };
  var command = function(commandName, args) {
    return 'php ' + coverageFolder + commandName + ' ' + args;
  };
  var args = '--';
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
    }
  ], function(err, results) {
    cb(err)
  });

});
