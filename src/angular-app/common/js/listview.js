
angular.module('palaso.ui.listview', [])
  // Typeahead
  .directive('listview', ["$timeout", function($timeout) {
		return {
			restrict : 'EA',
			transclude : true,
			replace : true,
			template : '<div class="listview"><div ng-transclude></div><div class="paginationblock"><pagination boundary-links="true" num-pages="noOfPages" current-page="currentPage" previous-text="\'&lsaquo;\'" next-text="\'&rsaquo;\'" first-text="\'&laquo;\'" last-text="\'&raquo;\'"></pagination></div></div>',
			scope : {
				search : "&",
				select : "&",
				itemsPerPage: "=",
				currentPage: "=",
				item: "="
			},
			controller: ["$scope", function($scope) {
				$scope.noOfPages = 3;
				$scope.currentPage = 1;
				$scope.maxSize = 5;
				$scope.itemsPerPage = 50;  // TODO: Add a control to change this RM 2013-07
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
//					$scope.search({
//						term : $scope.term
//					});
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('currentPage', function(currentPage) {
					controller.query(currentPage, scope.itemsPerPage);
				});
			}
		};
  }])
  ;
