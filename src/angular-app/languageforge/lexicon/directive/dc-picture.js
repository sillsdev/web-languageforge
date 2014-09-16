"use strict";

angular.module('palaso.ui.dc.picture', ['palaso.ui.dc.multitext', 'palaso.ui.notice', 'ngAnimate', 'bellows.services', 'angularFileUpload', 'lexicon.services'])
// Palaso UI Dictionary Control: Picture
.directive('dcPicture', [ function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-picture.html',
    scope: {
      config: "=",
      pictures: "=",
      control: "="
    },
    controller: ['$scope', '$http', 'sessionService', 'lexProjectService', 'silNoticeService', 'modalService', '$rootScope', 
    function($scope, $http, ss, lexProjectService, notice, modalService, $rootScope) {
      $scope.config.caption = angular.copy($scope.config);
      $scope.config.caption.label = '';
      delete $scope.config.caption.captionLabel;

      $scope.upload = {};
      $scope.upload.progress = 0;
      
      function addPicture(fileName) {
        var newPicture = {};
        newPicture.fileName = fileName;
        if (angular.isUndefined($scope.pictures)) {
          $scope.pictures = []; 
        }
        $scope.pictures.push(newPicture);
      };

      $scope.pictureUrl = function pictureUrl(fileName) {
        return '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + fileName;
      };

      $scope.deletePicture = function deletePicture(index) {
        var fileName = $scope.pictures[index].fileName;
        if (fileName) {
          var deletemsg = "Are you sure you want to delete the picture <b>'" + originalFileName(fileName) + "'</b>";
          modalService.showModalSimple('Delete Picture', deletemsg, 'Cancel', 'Delete Picture').then(function() {
            $scope.pictures.splice(index, 1);
            lexProjectService.removeMediaFile('sense-image', fileName, function(result) {
              if (result.ok) {
                if (! result.data.result) {
                  notice.push(notice.ERROR, result.data.errorMessage);
                }
              }
            });
          });
        } else {
          $scope.pictures.splice(index, 1);
        }
      };

      // strips the timestamp file prefix (returns everything after the '_')
      function originalFileName(fileName) {
        return fileName.substr(fileName.indexOf('_') + 1); 
      };

      $scope.onFileSelect = function onFileSelect(files, index) {

        // take the first file only
        var file = files[0];
        $scope.upload.file = file;
        if (file['size'] <= ss.fileSizeMax()) {
          $http.uploadFile({

            // upload.php script
            url: '/upload/lf-lexicon/sense-image',
            // headers: {'myHeaderKey': 'myHeaderVal'},
            // data: {'entryId': ''},
            file: file
          }).progress(function(evt) {
            $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);
            if (! $rootScope.$$phase) {
              $scope.$apply();
            }
          }).success(function(data, status, headers, config) {
            if (data.result) {
              $scope.upload.progress = 100.0;
              addPicture(data.data.fileName);
              $scope.upload.showAddPicture = false;
              $scope.upload.progress = 0;
              $scope.upload.file = null;
            } else {
              notice.push(notice.ERROR, data.data.errorMessage);
            }

            // to fix IE not updating the dom
            if (! $rootScope.$$phase) {
              $scope.$apply();
            }
          });
        } else {
          notice.push(notice.ERROR, file['name'] + " is too large.");
        }
      };
      
    }]
  };
}]);
