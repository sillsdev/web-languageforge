'use strict';

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
          this.tabIndex = index;
          this.tabs.forEach(function(val, i) {
            this.tabs[i].selected = i === index;
          }, this);
        };
      },
      link: function($scope, $element, $attrs, $ctrl) {
        $ctrl.selectTab($attrs.selected || $ctrl.tabIndex);
      },
      controllerAs: 'tabs',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.tabs.html'
    };
  }])
  .directive('puiTab', [function() {
    return {
      restrict: 'E',
      transclude: true,
      require: '^puiTabset',
      scope: {
        heading: '@'
      },
      template: '<div ng-show="tab.selected" class="tab-pane" ng-class="{active: tab.selected}"><div ng-transclude></div></div>',
      link: function($scope, $element, $attrs, $ctrl) {
        $scope.tab = {
          heading: $scope.heading,
          selected: false
        };
        $ctrl.addTab($scope.tab);
      }
    }
  }]);