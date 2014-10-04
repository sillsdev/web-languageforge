'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
// Lift Import Controller
.controller('LiftImportCtrl', ['$scope', '$upload', 'silNoticeService', 'lexProjectService', '$filter', '$location', 'sessionService', 
function LiftImportCtrl($scope, $upload, notice, lexProjectService, $filter, $location, ss) {
  lexProjectService.setBreadcrumbs('importExport', 'Import/export');

  $scope.upload = {};
  $scope.upload.mergeRule = 'createDuplicates';
  $scope.upload.skipSameModTime = true;
  $scope.upload.deleteMatchingEntry = false;

  $scope.onFileSelect = function onFileSelect($files) {
    
    // take the first file only
    $scope.upload.file = $files[0];
  };

  $scope.importLift = function importLift() {
    if ($scope.upload.file['size'] <= ss.fileSizeMax()) {
      notice.setLoading('Importing LIFT file...');
      $scope.upload.importStarted = true;
      $scope.upload.progress = 0;
      $upload.upload({

        // upload.php script
        'url': '/upload/lf-lexicon/import-lift',
        // 'headers': {'myHeaderKey': 'myHeaderVal'},
        'data': {
          'mergeRule': $scope.upload.mergeRule,
          'skipSameModTime': $scope.upload.skipSameModTime,
          'deleteMatchingEntry': $scope.upload.deleteMatchingEntry
        },
        'file': $scope.upload.file
      }).progress(function(evt) {
        $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);
      }).success(function(data, status, headers, config) {
        notice.cancelLoading();
        if (data.result) {
          $scope.upload.progress = 100.0;

          // reload the config after the import is complete
          ss.refresh(function() {
            notice.push(notice.SUCCESS, $filter('translate')("LIFT import completed successfully"));
            notice.push(notice.INFO, $filter('translate')('Your project was successfully imported.  Carefully review the dictionary configuration below before continuing, especially the input systems and fields tabs'));
            $location.path('/configuration');
          });
        } else {
          $scope.upload.progress = 0;
          notice.push(notice.ERROR, data.data.errorMessage);
        }
        $scope.upload.file = null;
      });
    } else {
      notice.push(notice.ERROR, "<b>" + $scope.upload.file.name + "</b> (" + $filter('bytes')($scope.upload.file.size) + 
          ") is too large. It must be smaller than " + $filter('bytes')(ss.fileSizeMax()) + ".");
      $scope.upload.progress = 0;
      $scope.upload.file = null;
    }

  };

}]).controller('LiftExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
function($scope, userService, ss, notice) {

}]);
