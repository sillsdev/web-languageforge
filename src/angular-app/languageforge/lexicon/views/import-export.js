'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
// Lift Import Controller
.controller('LiftImportCtrl', ['$scope', 'silNoticeService', 'fileReader', 'lexProjectService', '$filter', '$location', 'sessionService', 
function($scope, notice, fileReader, lexProjectService, $filter, $location, ss) {
  lexProjectService.setBreadcrumbs('importExport', 'Import/export');

  $scope.mergeRule = 'createDuplicates';
  $scope.skipSameModTime = true;
  $scope.deleteMatchingEntry = false;

  $scope.onFileSelect = function($files) {
    
    // take the first file only
    $scope.file = $files[0];
    fileReader.readAsDataUrl($scope.file, $scope).then(function(result) {
      $scope.file.data = result;
    });
  };

  $scope.importLift = function() {
    var importData = {
      file: $scope.file,
      settings: {
        mergeRule: $scope.mergeRule,
        skipSameModTime: $scope.skipSameModTime,
        deleteMatchingEntry: $scope.deleteMatchingEntry
      }
    };
    notice.setLoading('Importing LIFT file...');
    $scope.importStarted = true;
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
