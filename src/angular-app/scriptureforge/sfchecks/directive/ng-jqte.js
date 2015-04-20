
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
          var phase = scope.$$phase;
          element.jqteVal(ngModelCtrl.$viewValue);
        };
        var options = scope[attrs.puiJqte] === undefined ? {} : scope[attrs.puiJqte];
        options.change = function() {
          if (scope.$$phase == '$digest') {
            return;
          }
          scope.$apply(read);
        }; 
        element.jqte(options);
        //read(); // Leave this commented out, else the view will reset the model when initialized. CP 2013-08
        function read() {
          ngModelCtrl.$setViewValue(element.val());
        }
      }
    };
  }])
  ;
