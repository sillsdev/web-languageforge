
angular.module('palaso.ui.listview', ['ui.bootstrap'])
  // Typeahead
  .directive('listview', ['$filter', function($filter) {
    return {
      restrict : 'EA',
      transclude : true,
      replace : true,
      template : '<div class="listview" ng-hide="hideIfEmpty && items.length == 0"><div ng-transclude></div><div class="paginationblock"><pagination boundary-links="true" total-items="filteredItems.length" page="currentPage" items-per-page="itemsPerPage" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></pagination><div class="right pagination">Items per page: <select ng-model="itemsPerPage"><option value="10" selected>10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></div></div></div>',
      scope : {
        search : "&",
        select : "&",
        items: "=",
        hideIfEmpty: "@",
        visibleItems: "=",
        itemsFilter: "=?",
      },
      controller: ["$scope", function($scope) {
        $scope.noOfPages = 3;  // TODO: calculate this automatically
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.itemsPerPage = 10;  // This should match the default value for the selector above
        $scope.items = []; // This prevents "cannot read property 'length' of undefined" errors on first page load
        
        this.activate = function(item) {
          $scope.active = item;
          $scope.select({
            item : item
          });
        };
        this.activateNextItem = function() {
          var index = $scope.items.indexOf($scope.active);
          this.activate($scope.filteredItems[(index + 1) % $scope.filteredItems.length]);
        };
        this.activatePreviousItem = function() {
          var index = $scope.filteredItems.indexOf($scope.active);
          this.activate($scope.filteredItems[index === 0 ? $scope.filteredItems.length - 1 : index - 1]);
        };
        this.isActive = function(item) {
          return $scope.active === item;
        };
        this.selectActive = function() {
          this.select($scope.active);
        };
        this.updateVisibleItems = function() {
          var sliceStart;
          var sliceEnd;
          if ($scope.currentPage) {
            sliceStart = ($scope.currentPage-1) * $scope.itemsPerPage; // currentPage is 1-based
            sliceEnd = $scope.currentPage * $scope.itemsPerPage;
          } else {
            // Default to page 1 if undefined
            sliceStart = 0;
            sliceEnd = $scope.itemsPerPage;
          }
          $scope.visibleItems = $scope.filteredItems.slice(sliceStart, sliceEnd);
        };
        this.updatePages = function() {
          $scope.noOfPages = Math.ceil($scope.filteredItems.length / $scope.itemsPerPage);
          if ($scope.currentPage > $scope.noOfPages) {
            // This can happen if items have been deleted, for example
            $scope.currentPage = $scope.noOfPages;
          }
          if ($scope.currentPage < 1) {
            $scope.currentPage = 1;
          }
        };
        this.updateFilteredItems = function() {
          if ($scope.itemsFilter) {
            $scope.filteredItems = $filter('filter')($scope.items, $scope.itemsFilter);
          } else {
            $scope.filteredItems = $scope.items;
          };
        }
        this.query = function() {
          $scope.search();
          this.updateFilteredItems();
          this.updatePages();
//          $scope.search({
//            term : $scope.term
//          });
        };
      }],
      link : function(scope, element, attrs, controller) {
        scope.$watch('currentPage', function() {
          controller.updateVisibleItems();
        });
        scope.$watch('itemsPerPage', function() {
          controller.updatePages();
          controller.updateVisibleItems();
        });
        scope.$watch('items', function() {
          controller.updateFilteredItems();
        }, true);
        scope.$watch('filteredItems', function() {
          controller.updatePages();
          controller.updateVisibleItems();
        }, true);
        scope.$watch('itemsFilter', function() {
          controller.updateFilteredItems();
        })
        controller.query();
      }
    };
  }])
  ;
