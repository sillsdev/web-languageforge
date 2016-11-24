'use strict';

angular.module('sgw.soundmanager', [])

  // Sound Manager 2
  .directive('sgwSoundPlayer', function () {
    return {
      restrict: 'A',
      replace: false,
      scope: {
        href: '=',
        sgwState: '=?',
        sgwSound: '=?'
      },
      controller: ['$scope', function ($scope) {
        $scope.sgwState = 'stop';

        function onPlay() {
          this.setPosition(0);
        }

        function whilePlaying() {
          if (angular.isDefined(this.position)) {
            $scope.$apply();
          }
        }

        function onFinish() {
          this.setPosition(this.duration);
          $scope.sgwState = 'stop';
          $scope.$apply();
        }

        this.nextState = function () {
          if (angular.isDefined($scope.href) && $scope.href.trim() != '') {
            if (angular.isUndefined($scope.sgwSound)) {
              var filename = $scope.href.substring($scope.href.lastIndexOf('/') + 1);

              //noinspection JSUnusedGlobalSymbols
              $scope.sgwSound = soundManager.createSound({
                id: '_' + filename,
                url: $scope.href,
                autoLoad: true,
                autoPlay: false,
                onfinish: onFinish,
                whileplaying: whilePlaying
              });
            }
          }

          // without specifying these at play time, a reload of the sound does not fire them. IJH
          var playOptions = { onplay: onPlay, whileplaying: whilePlaying, onfinish: onFinish };
          if ($scope.sgwState == 'stop') {
            $scope.sgwState = 'play';
            if (angular.isDefined($scope.sgwSound)) {
              soundManager.pauseAll();
              $scope.sgwSound.play(playOptions);
            }
          } else if ($scope.sgwState == 'play') {
            if (angular.isDefined($scope.sgwSound)) $scope.sgwSound.pause();
            $scope.sgwState = 'pause';
          } else if ($scope.sgwState == 'pause') {
            if (angular.isDefined($scope.sgwSound)) $scope.sgwSound.resume();
            $scope.sgwState = 'play';
          }
        };
      }],

      link: function (scope, element, attrs, controller) {
        element.bind('click', function (e) {
          e.preventDefault();
          scope.$apply(function () {
            controller.nextState();
          });
        });
      }
    };
  });
