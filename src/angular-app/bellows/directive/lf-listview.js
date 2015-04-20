
angular.module('palaso.ui.lfListview', ['ui.bootstrap'])
  // Typeahead
  .directive('lfListview', ["$timeout", function($timeout) {
    return {
      restrict : 'EA',
      transclude : true,
      replace : true,
      template : '<div class="listview" ng-hide="hideIfEmpty && items.length == 0"><div ng-transclude></div><div class="paginationblock" style="text-align: center"><div style="width: 100%">{{itemsDisplayName}} {{firstItem}}-{{lastItem}} of {{items.length}}</div><pagination boundary-links="true" total-items="items.length" items-per-page="itemsPerPage" page="currentPage" previous-text="&lsaquo;" next-text="&rsaquo;" first-text="&laquo;" last-text="&raquo;"></pagination></div></div>',
      scope : {
        search : "&",
        select : "&",
        items: "=",
        hideIfEmpty: "@",
        visibleItems: "=",
        itemsPerPage: "=?",
        itemsDisplayName: "@",
      },
      controller: ["$scope", function($scope) {
        $scope.noOfPages = 3;  // TODO: calculate this automatically
        $scope.currentPage = 1;
        $scope.maxSize = 5;
        $scope.items = []; // Is this needed?
        $scope.itemsPerPage = $scope.itemsPerPage || 5;  // Sensible default if unspecified (should be 25, reduced to 5 for testing)
        // Note that we cannot set $scope.itemsDisplayName here; it doesn't work, because
        // the controller is run *before* bindings are set up. Has to be done in link function.

        this.activate = function(item) {
          $scope.active = item;
          $scope.select({
            item : item
          });
        };
        this.activateNextItem = function() {
          var index = $scope.items.indexOf($scope.active);
          this.activate($scope.items[(index + 1) % $scope.items.length]);
        };
        this.activatePreviousItem = function() {
          var index = $scope.items.indexOf($scope.active);
          this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
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
          $scope.visibleItems = $scope.items.slice(sliceStart, sliceEnd);
          $scope.firstItem = Math.max(sliceStart+1, 1);
          $scope.lastItem = Math.min(sliceEnd, $scope.items.length);
        };
        this.updatePages = function() {
          $scope.noOfPages = Math.ceil($scope.items.length / $scope.itemsPerPage);
          if ($scope.currentPage > $scope.noOfPages) {
            // This can happen if items have been deleted, for example
            $scope.currentPage = $scope.noOfPages;
          }
          if ($scope.currentPage < 1) {
            $scope.currentPage = 1;
          }
        };
        this.query = function() {
          $scope.search();
          this.updatePages();
//          $scope.search({
//            term : $scope.term
//          });
        };
      }],
      link : function(scope, element, attrs, controller) {
        attrs.$observe('itemsDisplayName', function(value) {
          // See http://stackoverflow.com/q/14876112
          scope.itemsDisplayName = value || "Items"; // Sensible default if attribute not set
        });
        scope.$watch('currentPage', function() {
          controller.updateVisibleItems();
        });
        scope.$watch('itemsPerPage', function() {
          controller.updatePages();
          controller.updateVisibleItems();
        });
        scope.$watch('items', function() {
          controller.updatePages();
          controller.updateVisibleItems();
        }, true);
        controller.query();
      }
    };
  }])
  ;
