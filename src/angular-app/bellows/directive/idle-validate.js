'use strict';

angular.module('palaso.ui.utils', [])
    // Typeahead
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
    }]);
