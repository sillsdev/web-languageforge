'use strict';

/* Directives */

angular.module('signup.directives', ['sf.services']).

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
})
// from :
// http://blog.brunoscopelliti.com/angularjs-directive-to-test-the-strength-of-a-password
.directive("checkStrength", function () {
    return {
        replace: false,
        restrict: 'EACM',
        link: function (scope, iElement, iAttrs) {

            var strength = {
                colors: ['#F00', '#F90', '#FF0', '#9F0', '#0F0'],
                mesureStrength: function (p) {

                    var _force = 0;                    
                    var _regex = '/[$-/:-?{-~!"^_`\[\]]/g';
                                          
                    var _lowerLetters = /[a-z]+/.test(p);                    
                    var _upperLetters = /[A-Z]+/.test(p);
                    var _numbers = /[0-9]+/.test(p);
                    var _symbols = _regex.test(p);
                                          
                    var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];                    
                    var _passedMatches = $.grep(_flags, function (el) { return el === true; }).length;                                          
                    
                    _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
                    _force += _passedMatches * 10;
                        
                    // penality (short password)
                    _force = (p.length <= 6) ? Math.min(_force, 10) : _force;                                      
                    
                    // penality (poor variety of characters)
                    _force = (_passedMatches == 1) ? Math.min(_force, 10) : _force;
                    _force = (_passedMatches == 2) ? Math.min(_force, 20) : _force;
                    _force = (_passedMatches == 3) ? Math.min(_force, 40) : _force;
                    
                    return _force;

                },
                getColor: function (s) {

                    var idx = 0;
                    if (s <= 10) { idx = 0; }
                    else if (s <= 20) { idx = 1; }
                    else if (s <= 30) { idx = 2; }
                    else if (s <= 40) { idx = 3; }
                    else { idx = 4; }

                    return { idx: idx + 1, col: this.colors[idx] };

                }
            };

            scope.$watch(iAttrs.checkStrength, function () {
                if (scope.record.password === '') {
                    iElement.css({ "display": "none"  });
                } else {
                    var c = strength.getColor(strength.mesureStrength(scope.record.password));
                    iElement.css({ "display": "inline" });
                    iElement.children('li')
                        .css({ "background": "#DDD" })
                        .slice(0, c.idx)
                        .css({ "background": c.col });
                }
            });

        },
        template: '<li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li><li class="point"></li>'
    };

})
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
.directive("uniqueUser",  ['userService', function UserCtrl(userService) {
    return {
        replace: false,
        require: "ngModel",
        restrict: 'A',
        link: function (scope, element, iAttrs, ngModelCtrl) {    	
            scope.$watch(iAttrs.uniqueUser, function () {
                if (scope.record.username=== undefined || scope.record.username === '') {
                	scope.usernameok=false;
                	scope.usernameexist=false;
                	scope.usernameloading=false;
                } else {          
    				scope.usernameok=false;
                	scope.usernameexist=false;
                	scope.usernameloading=true;
                	userService.usernameexists(scope.record.username, function(result) {
                		if (result.ok==true && result.data.succeed==true)
                			{
                        	scope.usernameok=false;
                        	scope.usernameexist=true;
                        	scope.usernameloading=false;
                        	if (!ngModelCtrl) return;			
                			ngModelCtrl.$setValidity("userexist", false);

                			}else
                				{
                				scope.usernameok=true;
                            	scope.usernameexist=false;
                            	scope.usernameloading=false;
                            	if (!ngModelCtrl) return;			
                    			ngModelCtrl.$setValidity("userexist", true);
                				}
            		});
                }
            });
        }
    };
}]);

