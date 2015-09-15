'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
// Lift Import Controller
.controller('LiftImportCtrl', ['$scope', '$upload', '$modal', 'silNoticeService', 'lexProjectService', '$filter', '$location', 'sessionService', 
function LiftImportCtrl($scope, $upload, $modal, notice, lexProjectService, $filter, $location, ss) {
  lexProjectService.setBreadcrumbs('importExport', 'Import/export');

  $scope.upload = {};
  $scope.upload.mergeRule = 'createDuplicates';
  $scope.upload.skipSameModTime = true;
  $scope.upload.deleteMatchingEntry = false;

  $scope.onFileSelect = function onFileSelect($files) {
    
    // take the first file only
    $scope.upload.file = $files[0];
    $scope.upload.isLift = (fileExtension($scope.upload.file.name) === 'lift');
  };

  $scope.importLift = function importLift() {
    if ($scope.upload.file.size <= ss.fileSizeMax()) {
      var uploadUrl = '/upload/lf-lexicon/import-lift';
      if ($scope.upload.isLift) {
        notice.setLoading('Importing LIFT file...');
      } else {
        notice.setLoading('Importing zipped file...');
        uploadUrl = '/upload/lf-lexicon/import-zip';
      }
      $scope.upload.importStarted = true;
      $scope.upload.progress = 0;
      $upload.upload({

        // Upload.php script
        'url': uploadUrl,
        // 'headers': {'myHeaderKey': 'myHeaderVal'},
        'data': {
          'filename': $scope.upload.file.name,
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
          var modalInstance = $modal.open({
            templateUrl: '/angular-app/languageforge/lexicon/views/import-results.html',
            controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
              $scope.show = {};
              $scope.show.importErrors = false;
              $scope.result = {
                'stats': data.data.stats,
                'importErrors': data.data.importErrors
              };
              $scope.ok = function() {
                $modalInstance.close();
              };
              $scope.hasImportErrors = function hasImportErrorrs() {
                return ($scope.result.importErrors !== '');
              };
              $scope.showImportErrorsButtonLabel = function showImportErrorsButtonLabel() {
                if ($scope.show.importErrors) {
                  return $filter('translate')("Hide non-critical import errors");
                }
                return $filter('translate')("Show non-critical import errors");
              };
            }]
          });

          // reload the config after the import is complete
          modalInstance.result.then()['finally'](function() {
            ss.refresh(function() {
              notice.push(notice.SUCCESS, $filter('translate')("Import completed successfully"));
              notice.push(notice.INFO, $filter('translate')('Your project was successfully imported.  Carefully review the dictionary configuration below before continuing, especially the input systems and fields tabs'));
              $location.path('/configuration');
            });
          });
        } else {
          $scope.upload.progress = 0;
          notice.push(notice.ERROR, data.data.errorMessage);
        }
        $scope.upload.file = null;
        $scope.upload.importStarted = false;
      });
    } else {
      notice.push(notice.ERROR, "<b>" + $scope.upload.file.name + "</b> (" + $filter('bytes')($scope.upload.file.size) + 
          ") is too large. It must be smaller than " + $filter('bytes')(ss.fileSizeMax()) + ".");
      $scope.upload.progress = 0;
      $scope.upload.file = null;
    }
  };
  
  // see http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
  function fileExtension(filename) {
    var a = filename.split('.');
    if (a.length === 1 || (a[0] === '' && a.length === 2)) {
      return '';
    }
    return a.pop().toLowerCase();
  };

}]);
