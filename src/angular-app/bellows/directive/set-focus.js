'use strict';
angular.module('palaso.ui.utils', [])

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
}]);