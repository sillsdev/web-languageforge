'use strict';

angular.module('palaso.ui.dc.audio', ['palaso.ui.dc.multitext', 'palaso.ui.notice',
  'bellows.services', 'ngFileUpload', 'lexicon.services', 'palaso.ui.soundplayer',
  'palaso.ui.mockUpload'])

  // Palaso UI Dictionary Control: Audio
  .directive('dcAudio', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/directive/dc-audio.html',
      scope: {
        dcFilename: '=',
        dcControl: '='
      },
      controller: ['$scope', 'Upload', 'sessionService', 'silNoticeService', 'lexProjectService',
        'modalService', '$state',
      function ($scope, Upload, sessionService, notice, lexProjectService,
                modalService, $state) {
        $scope.$state = $state;
        $scope.show = {
          audioUpload: false
        };

        function hasAudio() {
          if (angular.isUndefined($scope.dcFilename)) {
            return false;
          }

          return $scope.dcFilename.trim() !== '';
        }

        $scope.hasAudio = hasAudio;

        $scope.audioPlayUrl = function audioPlayUrl() {
          var url = '';
          if (hasAudio()) {
            url = '/assets/lexicon/' + $scope.dcControl.project.slug + '/audio/' +
              $scope.dcFilename;
          }

          return url;
        };

        $scope.audioDownloadUrl = function audioDownloadUrl() {
          var url = '';
          if (hasAudio()) {
            url = '/download' + $scope.audioPlayUrl();
          }

          return url;
        };

        $scope.formatTimestamp = function formatTimestamp(timestamp) {
          var totalSeconds = timestamp / 1000;
          var minutes = Math.floor(totalSeconds / 60);
          var seconds = Math.floor(totalSeconds % 60);
          seconds = (seconds < 10 ? '0' : '') + seconds;
          return minutes + ':' + seconds;
        };

        // strips the timestamp file prefix (returns everything after the '_')
        function originalFileName(filename) {
          if (angular.isUndefined(filename)) return '';
          if (!filename.trim()) return filename;

          return filename.substr(filename.indexOf('_') + 1);
        }

        $scope.displayFilename = function displayFilename() {
          return originalFileName($scope.dcFilename);
        };

        $scope.deleteAudio = function deleteAudio() {
          if (hasAudio()) {
            var deleteMsg = "Are you sure you want to delete the audio <b>'" +
              originalFileName($scope.dcFilename) + "'</b>";
            modalService.showModalSimple('Delete Audio', deleteMsg, 'Cancel', 'Delete Audio')
              .then(function () {
                lexProjectService.removeMediaFile('audio', $scope.dcFilename, function (result) {
                  if (result.ok) {
                    if (result.data.result) {
                      $scope.dcFilename = '';
                    } else {
                      notice.push(notice.ERROR, result.data.errorMessage);
                    }
                  }
                });
              }, angular.noop);
          }
        };

        $scope.uploadAudio = function uploadAudio(file) {
          if (!file || file.$error) return;

          sessionService.getSession().then(function (session) {
            if (file.size > session.fileSizeMax()) {
              notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
                $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
                $filter('bytes')(session.fileSizeMax()) + '.');
              return;
            }

            notice.setLoading('Uploading ' + file.name + '...');
            Upload.upload({
              url: '/upload/lf-lexicon/audio',
              data: {
                file: file,
                previousFilename: $scope.dcFilename,
                projectId: session.project().id
              }
            }).then(function (response) {
                notice.cancelLoading();
                var isUploadSuccess = response.data.result;
                if (isUploadSuccess) {
                  $scope.dcFilename = response.data.data.fileName;
                  $scope.show.audioUpload = false;
                  notice.push(notice.SUCCESS, 'File uploaded successfully.');
                } else {
                  notice.push(notice.ERROR, response.data.data.errorMessage);
                }
              },

              function (response) {
                notice.cancelLoading();
                var errorMessage = 'Upload failed.';
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
                notice.setPercentComplete(Math.floor(100.0 * evt.loaded / evt.total));
              });
          });
        };
      }]
    };
  }]);
