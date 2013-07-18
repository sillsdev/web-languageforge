
angular.module('palaso.ui.listview', [])
  // Typeahead
  .directive('listview', ["$timeout", function($timeout) {
		return {
			restrict : 'EA',
			transclude : true,
			replace : true,
			template : '<div class="listview"><div ng-transclude></div><div class="paginationblock"><pagination boundary-links="true" num-pages="noOfPages" current-page="currentPage" previous-text="\'&lsaquo;\'" next-text="\'&rsaquo;\'" first-text="\'&laquo;\'" last-text="\'&raquo;\'"></pagination><div class="right pagination">Items per page: <select ng-model="itemsPerPage"><option value="10" selected>10</option><option value="25">25</option><option value="50">50</option><option value="100">100</option></select></div></div></div>',
			scope : {
				search : "&",
				select : "&",
				itemsPerPage: "=",
				currentPage: "=",
				itemCount: "=",
				item: "="
			},
			controller: ["$scope", function($scope) {
				$scope.noOfPages = 3;  // TODO: calculate this automatically
				$scope.currentPage = 1;
				$scope.maxSize = 5;
				$scope.itemsPerPage = 10;  // This should match the default value for the selector above
				$scope.items = [];
				
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
				this.query = function(currentPage, itemsPerPage) {
					$scope.search();
					console.log($scope.itemCount, "items in list view.");
					$scope.noOfPages = Math.ceil($scope.itemCount / $scope.itemsPerPage);
					if ($scope.currentPage > $scope.noOfPages) {
						// This can happen if items have been deleted, for example
						$scope.currentPage = $scope.noOfPages;
					}
					if ($scope.currentPage < 1) {
						$scope.currentPage = 1;
					}
//					$scope.search({
//						term : $scope.term
//					});
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('currentPage + itemsPerPage + itemCount', function(currentPage, itemsPerPage) {
					controller.query(currentPage, itemsPerPage);
				});
			}
		};
  }])
  ;
