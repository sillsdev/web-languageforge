'use strict';

// Tab directives heavily inspired by https://toddmotto.com/directive-to-directive-communication-with-require/
angular.module('palaso.ui.tabset', [])
  .directive('puiTabset', [function() {
    return {
      restrict: 'E',
      scope: {},
      transclude: true,
      controller: function() {
        this.tabs = [];
        this.tabIndex = 0;
        this.addTab = function(tab) {
          this.tabs.push(tab);
        };
        this.selectTab = function(index) {
          this.tabs[index].onSelect();
          this.tabIndex = index;
          this.tabs.forEach(function(val, i) {
            this.tabs[i].selected = i === index;
          }, this);
        };
        this.selectedTab = function() {
          return this.tabs[this.tabIndex];
        };
      },
      link: function($scope, $element, $attrs, $ctrl) {
        $ctrl.selectTab($attrs.selected || $ctrl.tabIndex);
      },
      controllerAs: 'tabset',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.tabset.html'
    };
  }])
  .directive('puiTab', [function() {
    // Note: ng-if should not be used on a pui-tab directive if it will initially be false and afterwards become true.
    // Doing so causes the tab to be added last, and therefore shown as the last tab, regardless of the order it was
    // in the original template.
    return {
      restrict: 'E',
      transclude: true,
      require: '^puiTabset',
      scope: {
        heading: '@',
        select: '&',
        tabIf: '='
      },
      template: '<div ng-show="tab.selected" class="tab-pane" ng-class="{active: tab.selected}"><div ng-transclude></div></div>',
      link: function($scope, $element, $attrs, $ctrl) {
        $scope.tab = {
          heading: $scope.heading,
          onSelect: $scope.select || angular.noop,
          selected: false,
          visible: function() {
            return $scope.tabIf !== false;
          }
        };
        $ctrl.addTab($scope.tab);
      }
    }
  }]);