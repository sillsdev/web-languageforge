(function(){
    'use strict';
    angular.module('angularjs-autogrow', []).directive('autogrow', ['$window', function($window){
        return {
            link: function($scope, $element, $attrs){

                /**
                 * Default settings
                 */
                $scope.attrs = {
                    rows: 1,
                    maxLines: 999,
                    heightOffset: 0
                };

                /**
                 * Merge defaults with user preferences
                 */
                for(var i in $scope.attrs){
                    if($attrs[i]){
                        $scope.attrs[i] = parseInt($attrs[i]);
                    }
                }

                /**
                 * Calculates the vertical padding of the element
                 * @returns {number}
                 */
                $scope.getOffset = function(){
                    var style = $window.getComputedStyle($element[0], null),
                        props = ['paddingTop', 'paddingBottom'],
                        offset = 0;

                    for(var i=0; i<props.length; i++){
                        offset += parseInt(style[props[i]]);
                    }
                    return offset;
                };

                /**
                 * Sets textarea height as exact height of content
                 * @returns {boolean}
                 */
                $scope.autogrowFn = function(){
                    var newHeight = 0, hasGrown = false;
                    if(($element[0].scrollHeight - $scope.offset) > $scope.maxAllowedHeight){
                        $element[0].style.overflowY = 'scroll';
                        newHeight = $scope.maxAllowedHeight;
                    }
                    else {
                        $element[0].style.overflowY = 'hidden';
                        $element[0].style.height = 'auto';
                        newHeight = ($element[0].scrollHeight - $scope.attrs.heightOffset) - $scope.offset;
                        hasGrown = true;
                    }
                    $element[0].style.height = newHeight + 'px';
                    return hasGrown;
                };

                $scope.offset = $scope.getOffset();
                $scope.lineHeight = (($element[0].scrollHeight / $scope.attrs.rows) - ($scope.offset / $scope.attrs.rows)) - 4;
                $scope.maxAllowedHeight = ($scope.lineHeight * $scope.attrs.maxLines) - $scope.offset;

                $scope.$watch($attrs.ngModel, $scope.autogrowFn);

                // Extract css properties to spy on
                var spyProps = $attrs.autogrow ? $attrs.autogrow.split(',') : [];
                angular.forEach(spyProps, function(property) {
                  // Set a watcher on each property
                  $scope.$watch(
                    function() {
                      return $element.css(property);
                    },
                    styleChangedCallBack
                  );
                });

                /**
                 *
                 * @param newValue
                 * @param oldValue
                 */
                function styleChangedCallBack(newValue, oldValue) {
                  if (newValue !== oldValue) {
                    $scope.autogrowFn();
                  }
                }

                /**
                 * Auto-resize when there's content on page load
                 */
                if($element[0].value != ''){
                    $scope.autogrowFn();
                }
            }
        }
    }]);
})();
