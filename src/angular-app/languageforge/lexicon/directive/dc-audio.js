'use strict';

angular.module('palaso.ui.dc.audio', ['palaso.ui.dc.multitext', 'palaso.ui.notice', 'ngAnimate',
  'bellows.services', 'ngFileUpload', 'lexicon.services', 'sgw.soundmanager',
  'palaso.ui.mockUpload'
])

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
        $scope.audioReady = false;

        function hasAudio() {
          if (angular.isUndefined($scope.dcFilename) ||
            angular.isDefined($scope.sound) && !$scope.sound.loaded
          ) {
            return false;
          }

          return $scope.dcFilename.trim() != '';
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

        function createSound() {
          if (!hasAudio()) return undefined;

          //noinspection JSUnusedGlobalSymbols
          return soundManager.createSound({
            id: '_' + $scope.dcFilename,
            url: $scope.audioPlayUrl(),
            autoLoad: true,
            autoPlay: false,
            onload: function () {
              if (this.readyState == 3) {
                $scope.$apply();
              }
            }
          });
        }

        soundManager.setup({
          url: 'vendor_bower/SoundManager2/swf/',
          flashVersion: 9, // optional: shiny features (default = 8)
          // optional: ignore Flash where possible, use 100% HTML5 mode
          //preferFlash : false,
          onready: function () {
            $scope.audioReady = true;
            $scope.sound = createSound();
          }
        });

        $scope.audioIcon = function audioIcon() {
          var map = {
            stop: 'fa fa-play',
            play: 'fa fa-pause',
            pause: 'fa fa-play'
          };
          return map[$scope.state];
        };

        $scope.formatTimestamp = function formatTimestamp(timestamp) {
          var totalSeconds = timestamp / 1000;
          var minutes = Math.floor(totalSeconds / 60);
          var seconds = Math.floor(totalSeconds % 60);
          seconds = (seconds < 10 ? '0' : '') + seconds;
          return minutes + ':' + seconds;
        };

        $scope.$watch('dcFilename', function (newValue, oldValue) {
          if (newValue !== oldValue && hasAudio()) {
            $scope.state = 'stop';
            $scope.sound = createSound();
          }
        });

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
              });
          }
        };

        $scope.uploadAudio = function uploadAudio(file) {
          if (!file || file.$error) return;
          if (file.size > sessionService.fileSizeMax()) {
            notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
              $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
              $filter('bytes')(sessionService.fileSizeMax()) + '.');
            return;
          }

          notice.setLoading('Uploading ' + file.name + '...');
          Upload.upload({
            url: '/upload/lf-lexicon/audio',
            data: {
              file: file,
              previousFilename: $scope.dcFilename
            }
          }).then(function (response) {
              notice.cancelLoading();
              var isUploadSuccess = response.data.result;
              if (isUploadSuccess) {
                $scope.dcFilename = response.data.data.fileName;
                $scope.show.audioUpload = false;
                $scope.sound = createSound();
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
              notice.setPercentComplete(100.0 * evt.loaded / evt.total);
            });
        };

      }]
    };
  }]);
