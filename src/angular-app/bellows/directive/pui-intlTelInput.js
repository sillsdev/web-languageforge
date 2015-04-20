'use strict';

angular.module('palaso.ui.intlTelInput', [])
 // Palaso UI International Telephone Input 
.directive('puiIntlTelInput', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          // Create the mobile phone field
            $(element).intlTelInput();
            // Watch the phone number to refresh the country flag 
            scope.$watch(attrs.ngModel, function (value) {
              $(element).intlTelInput("setNumber", value);
            });
            
            
        }
    };
}])
;
