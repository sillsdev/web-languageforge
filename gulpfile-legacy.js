
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

  // auto-generated files written to src/angular-app/bellows/core/input-systems/
  execute(
    './build-json-language-data.py',
    options,
    cb
  );
});

gulp.task('generate-language-picker-assets').description =
  'Update asset files used for language picker';
