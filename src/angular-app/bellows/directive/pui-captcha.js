'use strict';

angular.module('palaso.ui.captcha', [])

  // Palaso UI Mock Upload
  .directive('puiCaptcha', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-captcha.html',
      scope: {
        puiItems: '=',
        puiExpectedItemName: '=',
        puiSelected: '=',
      },
      controller: ['$scope', function($scope) {
        $scope.record = {
          selected: $scope.puiSelected,
        };
        $scope.$watch('record.selected', function(newValue, oldValue) {
          if (newValue !== oldValue) {
            $scope.puiSelected = $scope.record.selected;
          }
        });
        $scope.$watch('puiSelected', function(newValue, oldValue) {
          if (newValue !== oldValue && newValue !== $scope.record.selected) {
            $scope.record.selected = $scope.puiSelected;
          }
        });
      }]
    };
  }])

  ;
