import * as angular from 'angular';

import {LexiconRightsService} from '../../core/lexicon-rights.service';
import {LexOptionListItem} from '../../shared/model/option-list.model';

export const MultiOptionListModule = angular
  .module('palaso.ui.dc.multioptionlist', [])

  // Palaso UI Multioptionlist
  .directive('dcMultioptionlist', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multioptionlist.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      items: '=',
      selectField: '&',
      fieldName: '='
    },
    controller: ['$scope', '$state', 'lexRightsService', ($scope, $state, rightsService: LexiconRightsService) => {
      $scope.$state = $state;
      $scope.isAdding = false;
      $scope.valueToBeDeleted = '';
      $scope.contextGuid = $scope.$parent.contextGuid;

      rightsService.getRights().then(rights => {
        $scope.rights = rights;

        $scope.showDeleteButton = function showDeleteButton(valueToBeDeleted: string, value: string): boolean {
          if (angular.isDefined($scope.items) && $state.is('editor.entry') && rights.canEditEntry()) {
            return valueToBeDeleted === value;
          }

          return false;
        };
      });

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

      $scope.orderItemsByListOrder = (value: string): number => {
        if (angular.isDefined($scope.items)) {
          return $scope.items.map((item: LexOptionListItem) => item.value).indexOf(value);
        }

        return -1;
      };

      $scope.filterSelectedItems = (item: LexOptionListItem): boolean => {
        return $scope.model.values.indexOf(item.value) === -1;
      };

      $scope.showAddButton = function showAddButton(): boolean {
        return angular.isDefined($scope.items) && !$scope.isAdding &&
          $scope.model.values.length < $scope.items.length;
      };

      $scope.addValue = function addValue(): void {
        if (angular.isDefined($scope.newValue)) {
          $scope.model.values.push($scope.newValue);
        }

        $scope.newValue = '';
        $scope.isAdding = false;
      };

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
