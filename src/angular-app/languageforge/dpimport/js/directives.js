'use strict';

/* Directives */

angular.module('dpimport.directives', ['lf.services']).

// This directive's code is from http://stackoverflow.com/q/16016570/
  directive("requireEqual", function() {
	return {
		restrict: "A",
		require: "ngModel",
		scope: {
			requireEqual: "=",
		},
		// Basic idea is it's a directive to do validation, used like this:
		// <input type="password" ng-model="record.password"/>
		// <input type="password" ng-model="record.confirmPassword"
		// require-equal="record.password"/>
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
});

