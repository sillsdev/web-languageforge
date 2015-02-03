'use strict';

angular.module('palaso.ui.utils', [])
.directive('idleValidate', ["$interval", function($interval) {
    return {
        restrict: 'A',
        scope: {
            idleValidate: "&",
            idleValidateKeypress: "&",
            idleValidateMsec: "="
        },
        link: function (scope, element, attrs) {
            var intervalTimer;
            var milliseconds = scope.idleValidateMsec;
            if (!angular.isNumber(scope.idleValidateMsec)) {
                 milliseconds = 1000;
            }

            element.bind('keyup', function(event) {
                if (angular.isFunction(scope.idleValidateKeypress)) {
                    scope.$apply(scope.idleValidateKeypress);
                }
                if (angular.isDefined(intervalTimer)) {
                    $interval.cancel(intervalTimer);
                }
                intervalTimer = $interval(scope.idleValidate, milliseconds, 1);
            });
        }
    }
}])

// see http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
.directive('setFocus', ['$timeout', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            scope.$watch(attrs.setFocus, function(value) {
                if(value === true) {
                    $timeout(function() {
                        element[0].focus();
                        //scope[attrs.setFocus] = false;
                    });
                }
            });
        }
    };
}])

;
