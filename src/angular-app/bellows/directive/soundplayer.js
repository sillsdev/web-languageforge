'use strict';

angular.module('palaso.ui.soundplayer', [])
  .component('puiSoundplayer', {
      bindings: {
        url: '<',
        timeFormat: '<',
        seekAlwaysVisible: '='
      },
      controller: ['$scope', function ($scope) {
        var ctrl = this;
        var slider = document.getElementById('puiSoundplayerSlider');
        $scope.audioElement = document.createElement('audio');
        $scope.playing = false;

        $scope.audioElement.addEventListener('ended', function () {
          $scope.$apply(function () {
            if ($scope.playing) {
              $scope.togglePlayback();
            }
          });
        });

        ctrl.$onChanges = function (changes) {
          if (changes.url && changes.url.currentValue) {
            if ($scope.playing) $scope.togglePlayback();
            $scope.audioElement.src = changes.url.currentValue;
          }
        };

        ctrl.$onDestroy = function () {
          $scope.audioElement.pause();
        };

        $scope.iconClass = function () {
          return $scope.playing ? 'fa-pause' : 'fa-play';
        };

        $scope.togglePlayback = function () {
          $scope.playing = !$scope.playing;

          if ($scope.playing) {
            $scope.audioElement.play();
          } else {
            $scope.audioElement.pause();
          }
        };

        $scope.currentTimeInSeconds = function () {
          return $scope.audioElement.currentTime;
        };

        $scope.durationInSeconds = function () {
          return $scope.audioElement.duration;
        };

        $scope.duration = function () {
          return ctrl.timeFormat($scope.audioElement.duration * 1000);
        };

        $scope.currentTime = function () {
          return ctrl.timeFormat($scope.audioElement.currentTime * 1000);
        };

        $scope.audioElement.addEventListener('loadedmetadata', function () {
          $scope.$digest();
        });

        var previousFormattedTime = null;
        $scope.audioElement.addEventListener('timeupdate', function () {
          slider.value = $scope.audioElement.currentTime;
          // If the time as shown the user has changed, only then run a digest
          if (ctrl.currentTime && previousFormattedTime !== $scope.currentTime()) $scope.$digest();
        });

        $scope.seekVisible = function () {
          return $scope.playing || $scope.seekAlwaysVisible;
        };

        slider.addEventListener('change', function (e) {
          $scope.audioElement.currentTime = e.target.value;
        });
      }],

                                          // FIXME why is bootstrapVersion not defined here?
      templateUrl: '/angular-app/bellows/directive/' + 'bootstrap4' + '/pui-soundplayer.html'
    }
  );
