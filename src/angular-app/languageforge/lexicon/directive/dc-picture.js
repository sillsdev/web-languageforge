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
    controller: ['$scope', '$upload', 'sessionService', 'lexProjectService', 'lexConfigService', 'silNoticeService', 'modalService', '$rootScope', 
    function($scope, $upload, ss, lexProjectService, lexConfigService, notice, modalService, $rootScope) {
      $scope.upload = {};
      $scope.upload.progress = 0;
      $scope.upload.file = null;
      
      $scope.fieldContainsData = lexConfigService.fieldContainsData;
      
      function Picture(fileName, caption) {
        this.fileName = fileName || '';
        this.caption = caption || {};
      };
      
      Picture.prototype.getUrl = function pictureGetUrl() {
        return '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + this.fileName;
      };
      
      $scope.getPictureUrl = function getPictureUrl(fileName) {
        return '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + fileName;
      };

      // strips the timestamp file prefix (returns everything after the '_')
      function originalFileName(fileName) {
        return fileName.substr(fileName.indexOf('_') + 1); 
      };

      function addPicture(fileName) {
//        var newPicture = new Picture(fileName);
        var newPicture = {}, captionConfig = angular.copy($scope.config);
        captionConfig.type = 'multitext';
        newPicture.fileName = fileName;
        newPicture.caption = $scope.control.makeValidModelRecursive(captionConfig, {});
        if (angular.isUndefined($scope.pictures)) {
          $scope.pictures = []; 
        }
        $scope.pictures.push(newPicture);
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

      $scope.onFileSelect = function onFileSelect(files) {

        // take the first file only
        var file = files[0];
        $scope.upload.file = file;
        if (file['size'] <= ss.fileSizeMax()) {
          $scope.upload.progress = 0;
          $upload.upload({

            // upload.php script
            url: '/upload/lf-lexicon/sense-image',
            // headers: {'myHeaderKey': 'myHeaderVal'},
            // data: {'entryId': ''},
            file: file
          }).progress(function(evt) {
            $scope.upload.progress = parseInt(100.0 * evt.loaded / evt.total);
          }).success(function(data, status, headers, config) {
            if (data.result) {
              $scope.upload.progress = 100.0;
              addPicture(data.data.fileName);
              $scope.upload.showAddPicture = false;
            } else {
              $scope.upload.progress = 0;
              notice.push(notice.ERROR, data.data.errorMessage);
            }
            $scope.upload.file = null;
          });
        } else {
          $scope.upload.progress = 0;
          $scope.upload.file = null;
          notice.push(notice.ERROR, file['name'] + " is too large.");
        }
      };
      
    }]
  };
}]);
