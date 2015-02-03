'use strict';
angular.module('palaso.util.model.transform', [])
// from: http://stackoverflow.com/questions/14419651/angularjs-filters-on-ng-model-in-an-input
.directive('modelTransformLimit', function(){
	return {
		restrict : 'A',
		require: 'ngModel',
		scope: {
			'model-transform-limit': '@'
		},
		link: function(scope, element, attrs, modelCtrl) {

			modelCtrl.$parsers.push(function (inputValue) {
				var transformedInput = '';
				if (inputValue) {
					transformedInput = inputValue.toLowerCase().substring(0, parseInt(attrs.modelTransformLimit));

					if (transformedInput!=inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}
				}
				return transformedInput;
			});
		}
	};
})

// Truncate whitespace
.directive('modelTransformNoSpace', function(){
	return {
		restrict : 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {

			modelCtrl.$parsers.push(function (inputValue) {
				var transformedInput = '';
				if (inputValue) {
					transformedInput = inputValue.replace(/\s+/g, '');
					if (transformedInput!=inputValue) {
						modelCtrl.$setViewValue(transformedInput);
						modelCtrl.$render();
					}
				}
				return transformedInput;
			});
		}
	};
})

;
