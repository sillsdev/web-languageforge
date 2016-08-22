'use strict';

angular.module('palaso.ui.dc.picture', ['palaso.ui.dc.multitext', 'palaso.ui.notice', 'ngAnimate',
  'bellows.services', 'angularFileUpload', 'lexicon.services'])

// Palaso UI Dictionary Control: Picture
.directive('dcPicture', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-picture.html',
    scope: {
      config: '=',
      pictures: '=',
      control: '='
    },
    controller: ['$scope', '$state', '$upload', '$filter', 'sessionService', 'lexProjectService',
      'lexConfigService', 'silNoticeService', 'modalService',
    function ($scope, $state, $upload, $filter, sessionService, lexProjectService,
              lexConfigService, notice, modalService) {
      $scope.$state = $state;
      $scope.upload = {};
      $scope.upload.progress = 0;
      $scope.upload.file = null;

      $scope.fieldContainsData = lexConfigService.fieldContainsData;

      $scope.getPictureUrl = function getPictureUrl(picture) {
        if (isExternalReference(picture.fileName))
          return '/Site/views/shared/image/placeholder.png';
        return '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + picture.fileName;
      };

      $scope.getPictureDescription = function getPictureDescription(picture) {
        if (!isExternalReference(picture.fileName)) return picture.fileName;

        return 'This picture references an external file (' +
          picture.fileName +
          ') and therefore cannot be synchronized. ' +
          'To see the picture, link it to an internally referenced file. ' +
          'Replace the file here or in FLEx, move or copy the file to the Linked Files folder.';
      };

      function isExternalReference(fileName) {
        var isWindowsLink = (fileName.indexOf(':\\') >= 0);
        var isLinuxLink = (fileName.indexOf('//') >= 0);
        return isWindowsLink || isLinuxLink;
      }

      // strips the timestamp file prefix (returns everything after the '_')
      function originalFileName(fileName) {
        return fileName.substr(fileName.indexOf('_') + 1);
      }

      function addPicture(fileName) {
        var newPicture = {};
        var captionConfig = angular.copy($scope.config);
        captionConfig.type = 'multitext';
        newPicture.fileName = fileName;
        newPicture.caption = $scope.control.makeValidModelRecursive(captionConfig, {});
        $scope.pictures.push(newPicture);
      }

      $scope.deletePicture = function deletePicture(index) {
        var fileName = $scope.pictures[index].fileName;
        if (fileName) {
          var deleteMsg = "Are you sure you want to delete the picture <b>'" +
            originalFileName(fileName) + "'</b>";
          modalService.showModalSimple('Delete Picture', deleteMsg, 'Cancel', 'Delete Picture').
            then(function () {
              $scope.pictures.splice(index, 1);
              lexProjectService.removeMediaFile('sense-image', fileName, function (result) {
                if (result.ok) {
                  if (!result.data.result) {
                    notice.push(notice.ERROR, result.data.errorMessage);
                  }
                }
              });
            });
        } else {
          $scope.pictures.splice(index, 1);
        }
      };

      $scope.onFileSelect = function onFileSelect(files) {

        // take the first file only
        var file = files[0];
        $scope.upload.file = file;
        if (file.size <= sessionService.fileSizeMax()) {
          $scope.upload.progress = 0;
          $upload.upload({

            // Upload.php script
            url: '/upload/lf-lexicon/sense-image',

            // headers: {'myHeaderKey': 'myHeaderVal'},
            data: {
              filename: file.name
            },
            file: file
          }).progress(function (evt) {
            $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);
          }).success(function (data) {
            if (data.result) {
              $scope.upload.progress = 100.0;
              addPicture(data.data.fileName);
              $scope.upload.showAddPicture = false;
            } else {
              $scope.upload.progress = 0;
              notice.push(notice.ERROR, data.data.errorMessage);
            }

            $scope.upload.file = null;
          }).error(function (data, status) {
            var errorMessage = $filter('translate')('Import failed.');
            if (status > 0) {
              errorMessage += ' Status: ' + status;
              if (data) {
                errorMessage += '- ' + data;
              }
            }

            notice.push(notice.ERROR, errorMessage);
          });
        } else {
          $scope.upload.progress = 0;
          $scope.upload.file = null;
          notice.push(notice.ERROR, file.name + ' is too large.');
        }
      };
    }]
  };
}]);
