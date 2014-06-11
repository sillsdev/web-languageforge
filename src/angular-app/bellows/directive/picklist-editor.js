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
	return {
		restrict: 'AE',
		templateUrl: '/angular-app/bellows/directive/picklist-editor.html',
		scope: {
			clientItems: '=items',
			defaultKey: '=?',
		},
		controller: ['$scope', function($scope) {
			$scope.noteDataChange = function() {
				$scope.dataChanged = true;
			}
			$scope.isKeyValueObject = function(item) {
				return (item.hasOwnProperty("value"))
			};
			$scope.getValuesFromClient = function() {
				$scope.stopWatchingItems();
				if (angular.isDefined($scope.clientItems)) { // Might be called during setup
					$scope.items = [];
					$scope.clientWantsObjects = true;
					for (var i = 0, l = $scope.clientItems.length; i < l; i++) {
						var clientItem = $scope.clientItems[i];
						var item;
						if (clientItem.hasOwnProperty("value")) {
							item = angular.copy(clientItem);
						} else {
							item = {value: clientItem};
							$scope.clientWantsObjects = false;
						}
						if (!item.hasOwnProperty("key")) {
							// If client didn't supply keys, construct some
							item.key = item.value.replace(/ /gi, '_');
						}
						if ($scope.defaultKey && $scope.defaultKey === item.key) {
							$scope.defaultItem = item;
						}
						$scope.items.push(item);
					}
					$scope.dataChanged = false;
				}
				$scope.startWatchingItems();
			};
			$scope.returnValuesToClient = function() {
				$scope.stopWatchingItems();
				if ($scope.clientWantsObjects) {
					$scope.clientItems = $scope.items.slice();
				} else {
					// Build an array of values, then copy it all at once with Array.prototype.slice()
					var newValues = new Array();
					for (var i = 0, l = $scope.items.length; i < l; i++) {
						newValues.push($scope.items[i].value);
					}
					$scope.clientItems = newValues.slice();
				}
				if ($scope.defaultItem) {
					$scope.defaultKey = $scope.defaultItem.key;
				} else {
					$scope.defaultKey = null;
				}
				$scope.dataChanged = false;
				$scope.startWatchingItems();
			};

			// Activate Save and Reset buttons only when values have changed
			$scope.itemWatcher = function(newval, oldval) {
				if (angular.isDefined(newval) && newval != oldval) {
					$scope.noteDataChange();
				}
			};
			$scope.clientItemWatcher = function(newval, oldval) {
				if (angular.isDefined(newval) && newval != oldval) {
					$scope.getValuesFromClient(); // Might end up triggering after returnValuesToClient; figure out how to prevent that.
				}
			};
			$scope.startWatchingItems = function() {
				$scope.stopWatchingItems();
				$scope.disableItemWatcher = $scope.$watchCollection('items', $scope.itemWatcher);
				$scope.disableClientItemWatcher = $scope.$watch('clientItems', $scope.clientItemWatcher, true);
			};
			$scope.stopWatchingItems = function() {
				if ($scope.disableItemWatcher) {
					$scope.disableItemWatcher();
					$scope.disableClientItemWatcher();
					$scope.disableItemWatcher = undefined;
					$scope.disableClientItemWatcher = undefined;
				}
			};

			$scope.pickAddItem = function() {
				if ($scope.newValue) {
					$scope.items.push({value: $scope.newValue});
					$scope.newValue = undefined;
				}
			};
			$scope.pickRemoveItem = function(index) {
				$scope.items.splice(index, 1);
			};

			$scope.getValuesFromClient();
		}],
	};
});
