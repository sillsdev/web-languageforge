import * as angular from 'angular';

export const OptionListModule = angular
  .module('palaso.ui.dc.optionlist', [])

  // Palaso UI Optionlist
  .directive('dcOptionlist', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-optionlist.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      items: '=',
      fieldName: '='
    },
    controller: ['$scope', '$state', ($scope, $state) => {
      $scope.$state = $state;
      $scope.contextGuid = $scope.$parent.contextGuid;
      $scope.getDisplayName = function getDisplayName(value: string): string {
        let displayName = value;
        if (angular.isDefined($scope.items)) {
          for (const item of $scope.items) {
            if (item.key === value) {
              displayName = item.value;
              break;
            }
          }
        }

        return displayName;
      };
    }]
  })])
  .name;
