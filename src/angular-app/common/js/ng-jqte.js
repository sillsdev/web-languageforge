
// see http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController
angular.module('palaso.ui.jqte', [])
	// jqte
	.directive('puiJqte', ['$parse', function($parse) {
		return {
			restrict: 'A',
			require: '?ngModel', // This causes the controller in the link function to be the ngModelController
			link: function(scope, element, attrs, ngModelCtrl) {
				if (!ngModelCtrl) {
					return;
				}
				ngModelCtrl.$render = function() {
					element.val(ngModelCtrl.$viewValue);
				};
				var options = scope[attrs.puiJqte] === undefined ? {} : scope[attrs.puiJqte];
				options.change = function() {
					var v = element.val();
					console.log('change', v);
					scope.$apply(read);
				}; 
				element.jqte(options);
				function read() {
					ngModelCtrl.$setViewValue(element.val());
				}
			}
		};
	}])
	;
