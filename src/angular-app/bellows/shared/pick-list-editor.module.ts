import * as angular from 'angular';

export function PickListEditor(): angular.IDirective {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/bellows/shared/pick-list-editor.component.html',
    scope: {
      items: '=',
      defaultKey: '=?',
      pristineItems: '=?'
    },
    controller: ['$scope', ($scope: any) => {
      $scope.defaultKeyFunc = function defaultKeyFunc(value: string): string {
        return value.replace(/ /gi, '_');
      };

      $scope.showDefault = angular.isDefined($scope.defaultKey);

      $scope.deletableIndexes = [] as number[];

      $scope.pickAddItem = function pickAddItem() {
        if ($scope.newValue) {
          const keyFunc = $scope.keyFunc || $scope.defaultKeyFunc;
          const key = keyFunc($scope.newValue);
          $scope.items.push({ key, value: $scope.newValue });
          $scope.deletableIndexes.push($scope.items.length - 1);
          $scope.newValue = undefined;
        }
      };

      $scope.pickRemoveItem = function pickRemoveItem(index: number): void {
        // Remove index from deletableIndexes, shift all indexes *after* it up by 1
        $scope.deletableIndexes = $scope.deletableIndexes.map((i: number) => {
          if (i === index) return -1;
          else if (i < index) return i;
          else return i - 1;
        }).filter((i: number) => i !== -1);

        $scope.items.splice(index, 1);
      };

      // only unsaved items can be removed
      // TODO: implement search and replace to allow remove on any item. IJH 2015-03
      $scope.showRemove = function showRemove(index: number) {
        return ($scope.deletableIndexes.indexOf(index) !== -1);
      };

      $scope.onSort = function onSort(indexFrom: number, indexTo: number): void {
        if (indexFrom === indexTo) {
          return; // Nothing to do
        }

        // Ensure deletableIndexes stays up-to-date with the reordered items
        const lo = Math.min(indexFrom, indexTo);
        const hi = Math.max(indexFrom, indexTo);
        $scope.deletableIndexes = $scope.deletableIndexes.map((i: number) => {
          // Items before or after the rearranged block don't need to be touched
          if ((i < lo) || (i > hi)) {
            return i;
          } else if (i === indexFrom) {
            return indexTo;
          } else {
            if (indexFrom > indexTo) {
              // Something moved back, other items shift forward
              return i + 1;
            } else {
              // Something moved forward, other items shift back
              return i - 1;
            }
          }
        });
      };

      $scope.blur = function blur(elem: HTMLElement): void {
        elem.blur();
      };
    }]
  };
}

export function OnEnter(): angular.IDirective {
  return {
    link(scope, elem, attrs) {
      elem.bind('keydown keypress', (evt: Event) => {
        if ((evt as KeyboardEvent).which === 13) {
          scope.$apply(() => {
            scope.$eval(attrs.onEnter, { thisElement: elem, event: evt });
          });

          evt.preventDefault();
        }
      });
    }
  };
}

// see http://stackoverflow.com/questions/17089090/prevent-input-from-setting-form-dirty-angularjs
export function NoDirtyCheck(): angular.IDirective {
  // Interacting with input elements having this directive won't cause the form to be marked dirty.
  return {
    restrict: 'A',
    require: 'ngModel',
    link(scope, elm, attrs, ctrl: angular.INgModelController) {
      elm.focus(() => {
        ctrl.$pristine = false;
      });
    }
  };
}

export const PickListEditorModule = angular
  .module('palaso.ui.picklistEditor', ['angular-sortable-view'])
  .directive('picklistEditor', PickListEditor)
  .directive('onEnter', OnEnter)
  .directive('noDirtyCheck', NoDirtyCheck)
  .name;
