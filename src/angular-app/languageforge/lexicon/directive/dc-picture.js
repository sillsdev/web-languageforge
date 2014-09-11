"use strict";

angular.module('palaso.ui.dc.picture', ['palaso.ui.dc.multitext', 'ngAnimate', 'bellows.services', 'angularFileUpload', 'lexicon.services'])
// Palaso UI Dictionary Control: Picture
.directive('dcPicture', ['$http', function($http) {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-picture.html',
    scope: {
      config: "=",
      pictures: "=",
      control: "="
    },
    controller: ['$scope', 'sessionService', 'silNoticeService', 'modalService', function($scope, ss, notice, modalService) {
      $scope.config.caption = angular.copy($scope.config);
      $scope.config.caption.label = '';
      delete $scope.config.caption.captionLabel;

      $scope.addPicture = function addPicture() {
        var newPicture = {};
        $scope.control.makeValidModelRecursive($scope.config, newPicture);
        $scope.pictures.push(newPicture);
      };

      $scope.pictureUrl = function pictureUrl(fileName) {
        return '/assets/lexicon/' + $scope.control.project.slug + '/' + fileName;
      };

      $scope.deletePicture = function deletePicture(index) {
        var fileName = $scope.pictures[index].fileName;
        if (fileName) {
          var deletemsg = "Are you sure you want to delete the picture <b>'" + originalFileName(fileName) + "'</b>";
          modalService.showModalSimple('Delete Picture', deletemsg, 'Cancel', 'Delete Picture').then(function() {
            $scope.pictures.splice(index, 1);
          });
        } else {
          $scope.pictures.splice(index, 1);
        }
      };

      // strips the timestamp file prefix (returns everything after the '_')
      function originalFileName(fileName) {
        return fileName.substr(fileName.indexOf('_') + 1); 
      };

      $scope.progress = 0;
      $scope.uploadResult = '';
      $scope.onFileSelect = function onFileSelect(files, index) {

        // take the first file only
        var file = files[0];
        $scope.file = file;
        if (file['size'] <= ss.fileSizeMax()) {
          $http.uploadFile({

            // upload.php script
            url: '/upload/lf-lexicon/sense-image',
            // headers: {'myHeaderKey': 'myHeaderVal'},
            // data: {'entryId': ''},
            file: file
          }).progress(function(evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            if (!$scope.$$phase) {
              $scope.$apply();
            }
          }).success(function(data, status, headers, config) {
            if (data.result) {
              $scope.progress = 100.0;
              $scope.uploadResult = 'File uploaded successfully.';
              notice.push(notice.SUCCESS, $scope.uploadResult);
              $scope.pictures[index].fileName = data.data.fileName;
            } else {
              notice.push(notice.ERROR, data.data.errorMessage);
              if (data.data.errorType == 'UserMessage') {
                $scope.uploadResult = data.data.errorMessage;
              }
            }

            // to fix IE not updating the dom
            if (! $scope.$$phase) {
              $scope.$apply();
            }
          });
        } else {
          $scope.uploadResult = file['name'] + " is too large.";
        }
      };
      
    }],
    link: function(scope, element, attrs, controller) {
    }
  };
}]);
