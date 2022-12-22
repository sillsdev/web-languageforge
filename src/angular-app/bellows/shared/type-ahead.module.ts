import * as angular from 'angular';

export function PuiTypeahead($interval: angular.IIntervalService): angular.IDirective {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    templateUrl: '/angular-app/bellows/shared/type-ahead.component.html',
    scope: {
      search: '=',
      select: '=',
      items: '=',
      term: '=term',
      placeholder: '='
    },
    controller: ['$scope', function TypeAheadController($scope: any) {
      $scope.hide = false;

      this.activate = function activate(item: any): void {
        $scope.active = item;
      };

      this.activateNextItem = function activateNextItem(): void {
        const index = $scope.items.indexOf($scope.active);
        this.activate($scope.items[(index + 1) % $scope.items.length]);
      }.bind(this);

      this.activatePreviousItem = function activatePreviousItem(): void {
        const index = $scope.items.indexOf($scope.active);
        this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
      }.bind(this);

      this.isActive = function isActive(item: any): boolean {
        return $scope.active === item;
      };

      this.selectActive = function selectActive(): void {
        this.select($scope.active);
      }.bind(this);

      this.select = function select(item: any): void {
        $scope.hide = true;
        $scope.focused = true;
        $scope.select(item);
      };

      $scope.isVisible = function isVisible(): void {
        return !$scope.hide && ($scope.focused || $scope.mousedOver);
      };

      $scope.query = function query(): void {
        if ($scope.term) {
          $scope.hide = false;
          $scope.search($scope.term.normalize());
        } else {
          // Hide when no search term
          $scope.hide = true;
        }
      };

      $scope.clearSearch = function clearSearch(): void {
        $scope.term = '';
        $scope.items = [];
      };
    }],

    link(scope: any, element, attrs, controller: any) {
      const $input = document.querySelector<HTMLInputElement>('#typeaheadInput');
      const $list = document.querySelector<HTMLElement>('.typeahead-results');
      $input.addEventListener('focus', () => {
        scope.$apply(() => {
          scope.focused = true;
        });
      });

      $input.addEventListener('blur', () => {
        scope.$apply(() => {
          scope.focused = false;
        });
      });

      $list.addEventListener('mouseover', () => {
        scope.$apply(() => {
          scope.mousedOver = true;
        });
      });

      $list.addEventListener('mouseleave', () => {
        scope.$apply(() => {
          scope.mousedOver = false;
        });
      });

      $input.addEventListener('keyup', (e: Event) => {
        if ((e as KeyboardEvent).keyCode === 9 || (e as KeyboardEvent).keyCode === 13) {
          scope.$apply(() => {
            controller.selectActive();
          });
        }

        if ((e as KeyboardEvent).keyCode === 27) {
          scope.$apply(() => {
            scope.hide = true;
          });
        }
      });

      $input.addEventListener('keydown', e => {
        if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 27) {
          e.preventDefault();
        }

        if (e.keyCode === 40) {
          e.preventDefault();
          scope.$apply(() => {
            controller.activateNextItem();
          });
        }

        if (e.keyCode === 38) {
          e.preventDefault();
          scope.$apply(() => {
            controller.activatePreviousItem();
          });
        }
      });

      scope.$watch('items', (items: any[]) => {
        if (!items) return;
        controller.activate(items.length ? items[0] : null);
      });

      scope.$watch('focused', (focused: boolean) => {
        if (focused) {
          $interval(() => {
            $input.focus();
          }, 0, 1, false);
        }
      });

      scope.$watch('isVisible()', (visible: boolean) => {
        if (visible) {
          $list.style.setProperty('top', `${$input.offsetTop + $input.offsetHeight}px`);
          $list.style.setProperty('left', `${$input.offsetLeft}px`);
          $list.style.setProperty('position', `absolute`);
          $list.style.setProperty('display', `block`);
        } else {
          $list.style.setProperty('display', 'none');
        }
      });
    }
  };
}
PuiTypeahead.$inject = ['$interval'];

export function TypeaheadItem(): angular.IDirective {
  return {
    require: '^puiTypeahead',
    link(scope, element, attrs, controller: any) {
      const item = scope.$eval(attrs.typeaheadItem);

      scope.$watch(() => controller.isActive(item), active => {
        if (active) {
          element.addClass('active');
        } else {
          element.removeClass('active');
        }
      });

      element.bind('mouseenter', () => {
        scope.$apply(() => {
          controller.activate(item);
        });
      });

      element.bind('click', () => {
        scope.$apply(() => {
          controller.select(item);
        });
      });
    }
  };
}

export const TypeAheadModule = angular
  .module('palaso.ui.typeahead', [])
  .directive('puiTypeahead', PuiTypeahead)
  .directive('typeaheadItem', TypeaheadItem)
  .name;
