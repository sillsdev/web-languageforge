'use strict';

angular.module('palaso.ui.dc.picture', ['palaso.ui.dc.multitext', 'palaso.ui.notice',
  'bellows.services', 'ngFileUpload', 'lexicon.services'])

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
    controller: ['$scope', '$state', 'Upload', '$filter', 'sessionService', 'lexProjectService',
      'lexConfigService', 'silNoticeService', 'modalService',
    function ($scope, $state, Upload, $filter, sessionService, lexProjectService,
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

      $scope.uploadFile = function uploadFile(file) {
        if (!file || file.$error) return;

        sessionService.getSession().then(function(session) {
          if (file.size > session.fileSizeMax()) {
            $scope.upload.progress = 0;
            $scope.upload.file = null;
            notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
              $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
              $filter('bytes')(session.fileSizeMax()) + '.');
            return;
          }

          $scope.upload.file = file;
          $scope.upload.progress = 0;
          Upload.upload({
            url: '/upload/lf-lexicon/sense-image',
            data: { file: file }
          }).then(function (response) {
            var isUploadSuccess = response.data.result;
            if (isUploadSuccess) {
              $scope.upload.progress = 100.0;
              addPicture(response.data.data.fileName);
              $scope.upload.showAddPicture = false;
            } else {
              $scope.upload.progress = 0;
              notice.push(notice.ERROR, response.data.data.errorMessage);
            }

            $scope.upload.file = null;
          },

          function (response) {
            var errorMessage = $filter('translate')('Upload failed.');
            if (response.status > 0) {
              errorMessage += ' Status: ' + response.status;
              if (response.statusText) {
                errorMessage += ' ' + response.statusText;
              }

              if (response.data) {
                errorMessage += '- ' + response.data;
              }
            }

            $scope.upload.file = null;
            notice.push(notice.ERROR, errorMessage);
          },

          function (evt) {
            $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);
          });
        });
      };

    }]
  };
}]);
