'use strict';

angular.module('palaso.ui.showOverflow', [])
  // Palaso UI Show Overflow
  .directive('puiShowOverflow', [function() {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
        ngBindHtml: '='
      },
      link: function (scope, element, attrs) {
        var updateTitle = function updateTitle(newValue) {
          if (angular.isDefined(newValue) && 
              (element[0].offsetHeight > 0 || element[0].offsetWidth > 0)) {
            if (element[0].offsetHeight < element[0].scrollHeight ||
                element[0].offsetWidth < element[0].scrollWidth) {
              // make multiline and strip html tags
              var multiline = newValue.replace("</p><p>", "\r\n");
              attrs.$set('title', multiline.replace(/<[^>]+>/gm, ''));
            } else {
              attrs.$set('title', '');
            }
          }
        };
        
        scope.$watch('ngBindHtml', updateTitle);
        scope.$watch('ngModel', updateTitle);
      } 
    };
  }])
  ;
