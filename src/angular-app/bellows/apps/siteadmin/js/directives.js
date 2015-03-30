'use strict';

/* Directives */

angular.module('sfAdmin.directives', ["jsonRpc", "sfAdmin.filters"])
.directive("requireEqual", function() {
  return {
    restrict: "A",
    require: "ngModel",
    scope: {
      requireEqual: "=",
    },
    // Basic idea is it's a directive to do validation, used like this:
    // <input type="password" ng-model="record.password"/>
    // <input type="password" ng-model="record.confirmPassword" require-equal="record.password"/>
    link: function(scope, elem, attrs, ngModelCtrl) {
      // If for some reason we're getting called early, when ngModelCtrl
      // is not yet available, then do nothing.
      if (!ngModelCtrl) return;      
      ngModelCtrl.$parsers.unshift(function(newValue) {
        if (newValue == scope.requireEqual) {
          ngModelCtrl.$setValidity("match", true);
        } else {
          ngModelCtrl.$setValidity("match", false);
        }
      });
    },
  };
})
.directive('focusMe', ['$timeout', '$parse', function($timeout, $parse) {
  // This directive's code is from http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.focusMe);
      scope.$watch(model, function(value) {
        if(value === true) { 
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
      // to address @blesh's comment, set attribute value to 'false'
      // on blur event:
      element.bind('blur', function() {
        scope.$apply(model.assign(scope, false));
      });
    }
  };
}]);
;
