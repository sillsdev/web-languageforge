'use strict';

angular.module('palaso.ui.soundplayer', [])
  .component('puiSoundplayer', {
      bindings: {
        url: '<',
        timeFormat: '<'
      },
      controller: function ($scope) {
        var ctrl = this;
        var mostRecentlyPlayedAudioElement;
        $scope.audioElement = document.createElement('audio');
        $scope.playing = false;

        $scope.audioElement.addEventListener('ended', function () {
          $scope.$apply(function () {
            if ($scope.playing) $scope.togglePlayback();
          });
        });

        ctrl.$onChanges = function (changes) {
          if (changes.url.currentValue) {
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
            mostRecentlyPlayedAudioElement = $scope.audioElement;
          } else {
            $scope.audioElement.pause();
          }
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

        $scope.audioElement.addEventListener('timeupdate', function () {
          $scope.$digest();
        });
      },

      template: '<a ng-click="togglePlayback()"><i class="fa {{iconClass()}}"></i></a>'
        + '<span data-ng-if="audioElement.duration && $ctrl.timeFormat" ' +
        'class="audioProgress text-muted">{{currentTime()}} / {{duration()}}</span>'
    }
  );
