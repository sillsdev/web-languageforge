import * as angular from 'angular';

import {LexiconRightsService} from '../../core/lexicon-rights.service';
import {LexOptionListItem} from '../../shared/model/option-list.model';

interface WindowService extends angular.IWindowService {
  semanticDomains_en?: any;
}

export const FieldSemanticDomainModule = angular
  .module('palaso.ui.dc.semanticdomain', [])

  // Palaso UI Semanticdomain
  .directive('dcSemanticdomain', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-semanticdomain.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      selectField: '&',
      fieldName: '='
    },
    controller: ['$scope', '$state', '$window', 'lexRightsService',
    ($scope, $state, $window: WindowService, rightsService: LexiconRightsService) => {
      $scope.$state = $state;
      $scope.isAdding = false;
      $scope.valueToBeDeleted = '';
      $scope.contextGuid = $scope.$parent.contextGuid;

      function createOptions() {
        const options: any[] = [];
        angular.forEach($window.semanticDomains_en, item => {
          options.push(item);
        });

        return options;
      }

      $scope.options = createOptions();

      $scope.getDisplayName = function getDisplayName(key: string): string {
        let displayName = key;
        if (angular.isDefined($window.semanticDomains_en) && key in $window.semanticDomains_en) {
          displayName = $window.semanticDomains_en[key].value;
        }

        return displayName;
      };

      $scope.orderItemsByListOrder = function orderItemsByListOrder(value: string): string {
        return value;
      };

      $scope.filterSelectedOptions = function filterSelectedOptions(item: LexOptionListItem): boolean {
        if ($scope.model == null) {
          return false;
        }

        return $scope.model.values.indexOf(item.key) === -1;
      };

      $scope.showAddButton = function showAddButton(): boolean {
        if ($scope.model == null) {
          return false;
        }

        return (angular.isDefined($window.semanticDomains_en) && !$scope.isAdding
          && $scope.model.values.length < Object.keys($window.semanticDomains_en).length);
      };

      $scope.addValue = function addValue(): void {
        if (angular.isDefined($scope.newValue)) {
          $scope.model.values.push($scope.newValue);
        }

        $scope.newValue = '';
        $scope.isAdding = false;
      };

      rightsService.getRights().then(rights => {
        $scope.rights = rights;

        $scope.showDeleteButton = function showDeleteButton(valueToBeDeleted: string, value: string): boolean {
          if (angular.isDefined($window.semanticDomains_en) && $state.is('editor.entry')
            && rights.canEditEntry()
          ) {
            return valueToBeDeleted === value;
          }

          return false;
        };
      });

      $scope.deleteValue = function deleteValue(value: string): void {
        const index = $scope.model.values.indexOf(value);
        $scope.model.values.splice(index, 1);
      };

      $scope.selectValue = function selectValue(value: string): void {
        $scope.selectField({
          inputSystem: '',
          multioptionValue: $scope.getDisplayName(value)
        });
      };

    }]
  })])
  .name;
