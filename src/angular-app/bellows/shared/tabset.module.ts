import * as angular from 'angular';

interface Tab {
  heading: string;
  onSelect: () => void;
  selected: boolean;
  visible: () => boolean;
}

interface TabSetScope extends angular.IScope {
  active: number;
}

// ToDo: refactor both directives as Angular components - IJH 2018-07

export class TabSetController implements angular.IController {
  tabs: Tab[] = [];

  static $inject = ['$scope'];
  constructor(private $scope: TabSetScope) { }

  $onInit(): void {
    this.$scope.active = this.$scope.active || 0;

    this.$scope.$watch('active', (newValue: number, oldValue: number) => {
      if (newValue != null && newValue !== oldValue) {
        this.selectTab(newValue);
      }
    });
  }

  addTab(tab: Tab): void {
    this.tabs.push(tab);
  }

  selectTab(index: number): void {
    this.tabs[index].onSelect();
    this.$scope.active = index;
    for (const i of Object.keys(this.tabs)) {
      this.tabs[i].selected = (parseInt(i, 10) === index);
    }
  }

  selectedTab(): Tab {
    return this.tabs[this.$scope.active];
  }

}

// Tab directives heavily inspired by https://toddmotto.com/directive-to-directive-communication-with-require/
export function PuiTabset(): angular.IDirective {
  return {
    restrict: 'E',
    scope: {
      active: '=?'
    },
    transclude: true,
    controller: TabSetController,
    link($scope: any, $element, $attrs, $ctrl: TabSetController) {
      $ctrl.selectTab($attrs.selected || $scope.active);
    },
    controllerAs: '$ctrl',
    template: `
      <div>
          <div uib-dropdown class="d-md-none pui-tab-select">
              <button class="btn btn-std" uib-dropdown-toggle>{{$ctrl.selectedTab().heading}}</button>
              <div uib-dropdown-menu>
                  <a data-ng-repeat="tab in $ctrl.tabs" data-ng-if="tab.visible()"
                     href data-ng-click="$ctrl.selectTab($index)"
                     class="dropdown-item tab-link">
                      {{tab.heading}}</a>
              </div>
          </div>
          <ul class="nav nav-tabs d-none d-md-flex tab-links">
          <li class="nav-item" data-ng-repeat="tab in $ctrl.tabs" >
              <a data-ng-click="$ctrl.selectTab($index)" data-ng-if="tab.visible()" class="nav-link tab-link"
                 data-ng-class="{ active: tab.selected }" href>{{tab.heading}}</a>
          </li>
          </ul>
          <div data-ng-transclude></div>
      </div>
    `
  };
}

interface TabScope extends angular.IScope {
  heading: string;
  select: () => void;
  tabIf: boolean;
  tab: Tab;
}

export function PuiTab(): angular.IDirective {
  // Note: ng-if should not be used on a pui-tab directive if it will initially be false and
  // afterwards become true. Doing so causes the tab to be added last, and therefore shown as
  // the last tab, regardless of the order it was in the original template. Use tab-if instead.
  return {
    restrict: 'E',
    transclude: true,
    require: '^puiTabset',
    scope: {
      heading: '@',
      select: '&?',
      tabIf: '<'
    },
    template: `
      <div data-ng-show="tab.selected" class="tab-pane" data-ng-class="{ active: tab.selected }">
          <div data-ng-transclude></div>
      </div>`,
    link($scope: TabScope, $element, $attrs, $ctrl: TabSetController) {
      $scope.tab = {
        heading: $scope.heading,
        onSelect: $scope.select || (() => {}),
        selected: false,
        visible(): boolean {
          return $scope.tabIf !== false;
        }
      } as Tab;
      $ctrl.addTab($scope.tab);
    }
  };
}

export const TabSetModule = angular
  .module('palaso.ui.tabset', [])
  .directive('puiTabset', PuiTabset)
  .directive('puiTab', PuiTab)
  .name;
