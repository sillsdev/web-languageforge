
angular.module('palaso.ui.tagging', ['ui.bootstrap'])

  .directive('viewTags', ["$timeout", function($timeout) {
		return {
			template: '\
<div class="tag-list">\
	<ul>\
		<li ng-repeat="tag in tags" ng-mouseenter="show = true" ng-mouseleave="show = false">\
			{{tag}}\
			<img class="closeicon" src="/images/closeicon.svg" width="20" height="20" ng-show="show" ng-click="removeTag($index)"></img>\
		</li>\
	</ul>\
</div>\
',
			restrict: 'EA',
			replace: true,
			scope: {
				tags: "=",
			},
			controller: ["$scope", function($scope) {
				$scope.removeTag = function(tagIndex) {
					$scope.tags.splice(tagIndex, 1);
				}
			}],
			link: function(scope, element, attrs, controller) {
			},
		}
	}])

  .directive('addTags', ["$timeout", function($timeout) {
		return {
			template: '\
<form class="new-tags" ng-submit="addTags()">\
	<label for="inputtagstring">Add tags (comma-separated):</label>\
	<input type="text" name="inputtagstring" ng-model="inputtagstring"></input>\
	<a ng-click="addTags()"><i class="icon-plus"></i></a>\
</form>\
',
			restrict: 'EA',
			replace: true,
			scope: {
				tags: "=",
			},
			controller: ["$scope", function($scope) {
				// As the user types into the text input, the comma-separated
				// list of tags will be turned into an actual list and stored
				// in $scope.inputtaglist. Submitting the form will send those
				// tags to the client by setting $scope.tags.
				$scope.inputtagstring = '';
				$scope.inputtaglist = [];

				$scope.mergeArrays = function(a, b) {
					// From http://stackoverflow.com/a/13847481/2314532
					var set = {};
					var result = [];

					// Can't count on forEach being available; loop the manual way
					for (var i=0; i < a.length; i++) {
						var item = a[i];
						if (!set[item]) { // O(1) lookup
							set[item] = true;
							result.push(item);
						}
					}
					for (var i=0; i < b.length; i++) {
						var item = b[i];
						if (!set[item]) { // O(1) lookup
							set[item] = true;
							result.push(item);
						}
					}
					return result;
				}

				$scope.addTags = function() {
					console.log('Tags before submit', $scope.tags);
					console.log('User submitted', $scope.inputtaglist);
					$scope.tags = $scope.mergeArrays($scope.tags, $scope.inputtaglist);
					console.log('Tags after submit', $scope.tags);
				}
			}],
			link: function(scope, element, attrs, controller) {
				scope.$watch('inputtagstring', function(inputtagstring) {
					if (inputtagstring) {
						var taglist = inputtagstring.split(',');
						for (var i=0; i < taglist.length; i++) {
							taglist[i] = taglist[i].trim();
							// Guard against empty-string tags (i.e., "")
							if (!taglist[i]) {
								taglist.splice(i, 1);
								i--; // Stay on this index for next loop iteration
							}
						}
						scope.inputtaglist = taglist;
					}
				});
			},
		}
	}])
;
