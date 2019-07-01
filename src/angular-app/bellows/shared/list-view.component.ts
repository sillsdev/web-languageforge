import * as angular from 'angular';

export class ListViewController implements angular.IController {
  search: () => void;
  select: (item: any) => void;
  items: any[];
  hideIfEmpty: boolean;
  visibleItems: any[];
  // This prevents "cannot read property 'length' of undefined" errors on first page load
  filteredItems: any[] = [];
  itemsFilter: any[];

  itemsPerPage: string = '10';  // This should match the default value for the selector above
  currentPage: number = 1;

  private noOfPages: number = 3;  // TODO: calculate this automatically

  static $inject: string[] = ['$scope',
    '$filter'];
  constructor(private readonly $scope: angular.IScope,
              private readonly $filter: angular.IFilterService) { }

  $onInit(): void {
    this.query();

    this.$scope.$watch(() => this.items, () => {
      this.updateFilteredItems();
    }, true);

    this.$scope.$watch(() => this.filteredItems, (items: any[]) => {
      if (items) {
        this.updatePages();
        this.updateVisibleItems();
      }
    }, true);

    this.$scope.$watch(() => this.itemsFilter, () => {
      this.updateFilteredItems();
    });

  }

  changeItemsPerPage(): void {
    this.updatePages();
    this.updateVisibleItems();
  }

  updateVisibleItems(): void {
    let sliceStart;
    let sliceEnd;
    if (this.currentPage) {
      sliceStart = (this.currentPage - 1) * parseInt(this.itemsPerPage, 10); // currentPage is 1-based
      sliceEnd = this.currentPage * parseInt(this.itemsPerPage, 10);
    } else {
      // Default to page 1 if undefined
      sliceStart = 0;
      sliceEnd = parseInt(this.itemsPerPage, 10);
    }

    // On some E2E runs, up to two instances of this.filteredItems are not arrays
    // This occurs when loading the user-management app
    // Only once was it reproduced manually, with no noticable effects
    if (Array.isArray(this.filteredItems)) {
      this.visibleItems = this.filteredItems.slice(sliceStart, sliceEnd);
    }
    
  }

  private updatePages(): void {
    this.noOfPages = Math.ceil(this.filteredItems.length / parseInt(this.itemsPerPage, 10));
    if (this.currentPage > this.noOfPages) {
      // This can happen if items have been deleted, for example
      this.currentPage = this.noOfPages;
      this.updateVisibleItems();
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
      this.updateVisibleItems();
    }
  }

  private updateFilteredItems(): void {
    const items = this.items || [];
    if (this.itemsFilter) {
      this.filteredItems = this.$filter('filter')(items, this.itemsFilter);
    } else {
      this.filteredItems = items;
    }
  }

  private query(): void {
    this.search();
    this.updateFilteredItems();
    this.updatePages();
  }

}

export const ListViewComponent: angular.IComponentOptions = {
  bindings: {
    search: '&',
    select: '&',
    items: '=',
    hideIfEmpty: '@',
    visibleItems: '=',
    filteredItems: '=?',
    itemsFilter: '=?'
  },
  controller: ListViewController,
  transclude: true,
  templateUrl: '/angular-app/bellows/shared/list-view.component.html'
};

export const ListViewModule = angular
  .module('palaso.ui.listview', ['ui.bootstrap'])
  .component('listview', ListViewComponent)
  .name;
