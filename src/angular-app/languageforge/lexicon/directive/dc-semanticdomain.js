'use strict';

angular.module('palaso.ui.dc.semanticdomain', [])

// Palaso UI Semanticdomain
.directive('dcSemanticdomain', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-semanticdomain.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      selectField: '&'
    },
    controller: ['$scope', '$state', function ($scope, $state) {
      $scope.$state = $state;
      $scope.isAdding = false;
      $scope.valueToBeDeleted = '';

      function createOptions() {
        var options = [];
        angular.forEach(semanticDomains_en, function (item) {
          options.push(item);
        });

        return options;
      }

      $scope.options = createOptions();

      $scope.getDisplayName = function getDisplayName(key) {
        var displayName = key;
        if (angular.isDefined(semanticDomains_en) && key in semanticDomains_en) {
          displayName = semanticDomains_en[key].value;
        }

        return displayName;
      };

      $scope.orderItemsByListOrder = function orderItemsByListOrder(value) {
        return value;
      };

      $scope.filterSelectedOptions = function filterSelectedOptions(item) {
        return $scope.model.values.indexOf(item.key) == -1;
      };

      $scope.showAddButton = function showAddButton() {
        return (angular.isDefined(semanticDomains_en) && !$scope.isAdding
          && $scope.model.values.length < Object.keys(semanticDomains_en).length);
      };

      $scope.addValue = function addValue() {
        if (angular.isDefined($scope.newValue)) {
          $scope.model.values.push($scope.newValue);
        }

        $scope.newValue = '';
        $scope.isAdding = false;
      };

      $scope.showDeleteButton = function showDeleteButton(valueToBeDeleted, value) {
        if (angular.isDefined(semanticDomains_en) && $state.is('editor.entry')
          && $scope.control.rights.canEditEntry()) {
          return valueToBeDeleted == value;
        }

        return false;
      };

      $scope.deleteValue = function deleteValue(value) {
        var index = $scope.model.values.indexOf(value);
        $scope.model.values.splice(index, 1);
      };

      $scope.selectValue = function selectValue(value) {
        $scope.selectField({
          inputSystem: '',
          multioptionValue: $scope.getDisplayName(value)
        });
      };

    }]
  };
}]);
