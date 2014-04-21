'use strict';

angular.module('palaso.ui.scroll', [])
 // Palaso UI Infinite Scroll 
.directive('puiWhenScrolled', [function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight + 1000 >= raw.scrollHeight) {
                scope.$apply(attr.puiWhenScrolled);
//                raw.scrollTop = raw.scrollTop - 1000;
            }
        });
    };
}])
;
