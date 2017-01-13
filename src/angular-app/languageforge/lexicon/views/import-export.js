'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language',
  'ngAnimate', 'ngFileUpload', 'lexicon.upload'])
  .controller('LiftImportCtrl', ['$scope', 'Upload', '$modal', 'silNoticeService', 'lexProjectService', '$filter',
    '$location', 'sessionService',
  function ($scope, Upload, $modal, notice, lexProjectService, $filter,
            $location, sessionService) {
    lexProjectService.setBreadcrumbs('importExport', 'Import/export');

    $scope.upload = {};
    $scope.upload.mergeRule = 'createDuplicates';
    $scope.upload.skipSameModTime = true;
    $scope.upload.deleteMatchingEntry = false;

    $scope.onFileSelect = function onFileSelect($file) {
      $scope.upload.file = $file;
      $scope.upload.isLift = (fileExtension($scope.upload.file.name) === 'lift');
    };

    $scope.importLift = function importLift() {
      if (!$scope.upload.file || $scope.upload.file.$error) return;
      if ($scope.upload.file.size > sessionService.fileSizeMax()) {
        notice.push(notice.ERROR, '<b>' + $scope.upload.file.name + '</b> (' +
          $filter('bytes')($scope.upload.file.size) + ') is too large. It must be smaller than ' +
          $filter('bytes')(sessionService.fileSizeMax()) + '.');
        $scope.upload.progress = 0;
        $scope.upload.file = null;
        return;
      }

      var uploadUrl = '/upload/lf-lexicon/import-lift';
      if ($scope.upload.isLift) {
        notice.setLoading('Importing LIFT file...');
      } else {
        notice.setLoading('Importing zipped file...');
        uploadUrl = '/upload/lf-lexicon/import-zip';
      }

      $scope.upload.importStarted = true;
      $scope.upload.progress = 0;
      Upload.upload({
        url: uploadUrl,
        data: {
          file: $scope.upload.file,
          mergeRule: $scope.upload.mergeRule,
          skipSameModTime: $scope.upload.skipSameModTime,
          deleteMatchingEntry: $scope.upload.deleteMatchingEntry
        }
      }).then(function (response) {
          notice.cancelLoading();
          var isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            $scope.upload.progress = 100.0;
            var modalInstance = $modal.open({
              templateUrl: '/angular-app/languageforge/lexicon/views/' + bootstrapVersion + '/import-results.html',
              controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                $scope.show = {};
                $scope.show.importErrors = false;
                $scope.result = {
                  stats: response.data.data.stats,
                  importErrors: response.data.data.importErrors
                };
                $scope.ok = function () {
                  $modalInstance.close();
                };

                $scope.hasImportErrors = function hasImportErrorrs() {
                  return ($scope.result.importErrors !== '');
                };

                $scope.showImportErrorsButtonLabel = function showImportErrorsButtonLabel() {
                  if ($scope.show.importErrors) {
                    return $filter('translate')('Hide non-critical import errors');
                  }

                  return $filter('translate')('Show non-critical import errors');
                };
              }]
            });

            // reload the config after the import is complete
            modalInstance.result.then()['finally'](function () {
              sessionService.refresh(function () {
                notice.push(notice.SUCCESS, $filter('translate')('Import completed successfully'));
                notice.push(notice.INFO, $filter('translate')('Your project was successfully imported.  Carefully review the configuration below before continuing, especially the input systems and fields tabs'));
                $location.path('/configuration');
              });
            });
          } else {
            $scope.upload.progress = 0;
            notice.push(notice.ERROR, response.data.data.errorMessage);
          }

          $scope.upload.file = null;
          $scope.upload.importStarted = false;
        },

        function (response) {
          notice.cancelLoading();
          var errorMessage = $filter('translate')('Import failed.');
          if (response.status > 0) {
            errorMessage += ' Status: ' + response.status;
            if (response.statusText) {
              errorMessage += ' ' + response.statusText;
            }

            if (response.data) {
              errorMessage += '- ' + response.data;
            }
          }

          notice.push(notice.ERROR, errorMessage);
        },

        function (evt) {
          notice.setPercentComplete(100.0 * evt.loaded / evt.total);
        });
    };

    // see http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
    function fileExtension(filename) {
      var a = filename.split('.');
      if (a.length === 1 || (a[0] === '' && a.length === 2)) {
        return '';
      }

      return a.pop().toLowerCase();
    }

    
  }]);


  
