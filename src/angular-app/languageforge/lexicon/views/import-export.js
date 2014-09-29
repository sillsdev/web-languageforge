'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
// Lift Import Controller
.controller('LiftImportCtrl', ['$scope', 'silNoticeService', 'fileReader', 'lexProjectService', '$filter', '$location', 'sessionService', 
function($scope, notice, fileReader, lexProjectService, $filter, $location, ss) {
  lexProjectService.setBreadcrumbs('importExport', 'Import/export');

  $scope.upload = {};
  $scope.upload.mergeRule = 'createDuplicates';
  $scope.upload.skipSameModTime = true;
  $scope.upload.deleteMatchingEntry = false;

  $scope.onFileSelect = function($files) {
    
    // take the first file only
    $scope.upload.file = $files[0];
    fileReader.readAsDataUrl($scope.upload.file, $scope).then(function(result) {
      $scope.upload.file.data = result;
    });
  };

  $scope.importLift = function importLift() {
    var importData = {
      file: $scope.upload.file,
      settings: {
        mergeRule: $scope.upload.mergeRule,
        skipSameModTime: $scope.upload.skipSameModTime,
        deleteMatchingEntry: $scope.upload.deleteMatchingEntry
      }
    };
    notice.setLoading('Importing LIFT file...');
    $scope.upload.importStarted = true;
    lexProjectService.importLift(importData, function(result) {
      if (result.ok) {

        // reload the config after the import is complete
        ss.refresh(function() {
          notice.cancelLoading();
          notice.push(notice.SUCCESS, $filter('translate')("LIFT import completed successfully"));
          notice.push(notice.INFO, $filter('translate')('Your project was successfully imported.  Carefully review the dictionary configuration below before continuing, especially the input systems and fields tabs'));
          $location.path('/configuration');
        });
      } else {
        notice.cancelLoading();
      }
    });
  };

}]).controller('LiftExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
function($scope, userService, ss, notice) {

}]);
