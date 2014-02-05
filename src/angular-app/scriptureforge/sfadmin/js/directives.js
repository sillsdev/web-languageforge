'use strict';

/* Directives */

angular.module('sfAdmin.directives', ["jsonRpc", "sfAdmin.filters"])
	.directive('ngBlur', ['$parse', function($parse) {
	  return function(scope, element, attr) {
	    var fn = $parse(attr['ngBlur']);
	    element.bind('blur', function(event) {
	      scope.$apply(function() {
	        fn(scope, {$event:event});
	      });
	    });
	  }
	}])
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
// This directive's code is from http://stackoverflow.com/q/16016570/
.directive('ngFocus', function($parse, $timeout) {
	return function(scope, elem, attrs) {
		var ngFocusGet = $parse(attrs.ngFocus);
		var ngFocusSet = ngFocusGet.assign;
		if (!ngFocusSet) {
			throw Error("Non assignable expression");
		}
		console.log("In ng-focus directive, trying to focus with var ", attrs.ngFocus);

		var abortFocusing = false;
		var unwatch = scope.$watch(attrs.ngFocus, function(newVal){
			if(newVal){
				$timeout(function(){
					elem[0].focus();  
				},0);
			}
			else {
				$timeout(function(){
					elem[0].blur();
				},0);
			}
		});


		elem.bind("blur", function(){

			if(abortFocusing) return;

			$timeout(function(){
				ngFocusSet(scope,false);
			},0);

		});


		var timerStarted = false;
		var focusCount = 0;

		function startTimer(){
			$timeout(function(){
				timerStarted = false;
				if(focusCount > 3){
					unwatch();
					abortFocusing = true;
					throw new Error("Aborting : ngFocus cannot be assigned to the same variable with multiple elements");
				}
			},200);
		}

		elem.bind("focus", function(){

			if(abortFocusing) return;

			if(!timerStarted){
				timerStarted = true;
				focusCount = 0;
				startTimer();
			}
			focusCount++;

			$timeout(function(){
				ngFocusSet(scope,true);
			},0);

		});
	};
});
