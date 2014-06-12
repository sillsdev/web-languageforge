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
			items: '=',
			defaultKey: '=?',
		},
		controller: ['$scope', function($scope) {
			$scope.pickAddItem = function() {
				if ($scope.newValue) {
					$scope.items.push({value: $scope.newValue});
					$scope.newValue = undefined;
				}
			};
			$scope.pickRemoveItem = function(index) {
				$scope.items.splice(index, 1);
			};
		}],
	};
});
