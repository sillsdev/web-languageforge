'use strict';

angular.module('palaso.ui.dc.multioptionlist', [])

// Palaso UI Optionlist
.directive('dcMultioptionlist', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-multioptionlist.html',
    scope: {
      config: "=",
      model: "=",
      control: "=",
      items: "="
    },
    controller: ['$scope', function($scope) {
      $scope.getDisplayName = function getDisplayName(value) {
        var displayName = value;
        if (angular.isDefined($scope.items)) {
          for (var i = 0; i < $scope.items.length; i++) {
            if ($scope.items[i].key == value) {
              displayName = $scope.items[i].value;
              break;
            }
          }
        }
        return displayName;
      };

      $scope.addValue = function addValue() {
        if (angular.isDefined($scope.newValue)) {
          $scope.model.values.push($scope.newValue);
        }
      };

    }],
    link: function(scope, element, attrs, controller) {
    }
  };
}]);
