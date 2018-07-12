'use strict';

// Tab directives heavily inspired by https://toddmotto.com/directive-to-directive-communication-with-require/
angular.module('palaso.ui.tabset', [])
  .directive('puiTabset', [function () {
    return {
      restrict: 'E',
      scope: {
        active: '=?'
      },
      transclude: true,
      controller: ['$scope', function ($scope) {
        this.tabs = [];
        $scope.active = $scope.active | 0;

        $scope.$watch('active', function (newValue, oldValue) {
          if (newValue != null && newValue !== oldValue) {
            this.selectTab(newValue);
          }
        }.bind(this));

        this.addTab = function (tab) {
          this.tabs.push(tab);
        };

        this.selectTab = function (index) {
          this.tabs[index].onSelect();
          $scope.active = index;
          this.tabs.forEach(function (val, i) {
            this.tabs[i].selected = i === index;
          }, this);
        };

        this.selectedTab = function () {
          return this.tabs[$scope.active];
        };
      }],

      link: function ($scope, $element, $attrs, $ctrl) {
        $ctrl.selectTab($attrs.selected || $scope.active);
      },

      controllerAs: 'tabset',
      templateUrl: '/angular-app/bellows/shared/tabset.html'
    };
  }])

  .directive('puiTab', [function () {
    // Note: ng-if should not be used on a pui-tab directive if it will initially be false and
    // afterwards become true. Doing so causes the tab to be added last, and therefore shown as
    // the last tab, regardless of the order it was in the original template.
    return {
      restrict: 'E',
      transclude: true,
      require: '^puiTabset',
      scope: {
        heading: '@',
        select: '&',
        tabIf: '='
      },
      template: '<div ng-show="tab.selected" class="tab-pane" ng-class="{active: tab.selected}">' +
        '<div ng-transclude></div></div>',
      link: function ($scope, $element, $attrs, $ctrl) {
        $scope.tab = {
          heading: $scope.heading,
          onSelect: $scope.select || angular.noop,
          selected: false,
          visible: function () {
            return $scope.tabIf !== false;
          }
        };
        $ctrl.addTab($scope.tab);
      }
    };
  }])

  ;
