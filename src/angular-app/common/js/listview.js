
angular.module('palaso.ui', [])
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
				items : "=",
				item: "="
			},
			controller: ["$scope", function($scope) {
				$scope.noOfPages = 3;
				$scope.currentPage = 1;
				$scope.maxSize = 5;
				$scope.selectedIndex = -1;
				$scope.items = [];
				$scope.hide = false;
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
				this.query = function(currentPage) {
					$scope.search();
//					$scope.search({
//						term : $scope.term
//					});
				};
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('currentPage', function(currentPage) {
					controller.query(currentPage);
				});
				scope.$watch('items', function(items) {
					controller.activate(items.length ? items[0] : null);
				});
			}
		};
  }])
  .directive('listviewItem', function() {
	return {
		require : '^listview',
		link : function(scope, element, attrs, controller) {

			var item = scope.$eval(attrs.listviewItem);

			scope.$watch(function() {
				return controller.isActive(item);
			}, function(active) {
				if (active) {
					element.addClass('active');
				} else {
					element.removeClass('active');
				}
			});

//			element.bind('mouseenter', function(e) {
//				scope.$apply(function() {
//					controller.activate(item);
//				});
//			});

			element.bind('click', function(e) {
				scope.$apply(function() {
					controller.activate(item);
				});
			});
		}
	};
  })
  ;