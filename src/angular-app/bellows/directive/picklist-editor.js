'use strict';

angular.module('palaso.ui.picklistEditor', ['ngRepeatReorder'])
.directive('onEnter', function() {
	return function(scope, elem, attrs) {
		elem.bind('keydown keypress', function(evt) {
			if (evt.which == 13) {
				scope.$apply(function() {
					scope.$eval(attrs.onEnter);
				});
				evt.preventDefault();
			}
		});
	};
})
.directive('picklistEditor', function() {
	console.log('Setting up picklistEditor directive');
	return {
		restrict: 'AE',
		templateUrl: '/angular-app/bellows/directive/picklist-editor.html',
		scope: {
			values: '=',
			picklistName: '@name',
		},
		controller: ['$scope', function($scope) {
			$scope.getValuesFromClient = function() {
				$scope.items = [];
				for (var i = 0, l = $scope.values.length; i < l; i++) {
					$scope.items.push({value: $scope.values[i]});
				}
				$scope.dataChanged = false;
				$scope.startWatchingItems();
			};
			$scope.returnValuesToClient = function() {
				// Build a new array, then copy it all at once with Array.prototype.slice()
				var newValues = new Array();
				for (var i = 0, l = $scope.items.length; i < l; i++) {
					newValues.push($scope.items[i].value);
				}
				$scope.values = newValues.slice();
				$scope.dataChanged = false;
				$scope.startWatchingItems();
			};

			// Activate Save and Reset buttons only when values have changed
			$scope.itemWatcher = function(newval, oldval) {
				if (newval && newval != oldval) {
					$scope.dataChanged = true;
					// Since a values watch is expensive, stop watching after first time data changes
					$scope.stopWatchingItems();
				}
			};
			$scope.stopWatchingItems = function() {
				if ($scope.deregisterItemWatcher) {
					$scope.deregisterItemWatcher();
					$scope.deregisterItemWatcher = undefined;
				}
			};
			$scope.startWatchingItems = function() {
				if ($scope.deregisterItemWatcher) {
					$scope.deregisterItemWatcher();
				}
				$scope.deregisterItemWatcher = $scope.$watch('items', $scope.itemWatcher, true);
			};

			$scope.pickAddItem = function() {
				if ($scope.newValue) {
					$scope.items.push({value: $scope.newValue});
					$scope.newValue = undefined;
				}
			}
			$scope.pickRemoveItem = function(index) {
				$scope.items.splice(index, 1);
			}

			$scope.getValuesFromClient();
		}],
	};
});
