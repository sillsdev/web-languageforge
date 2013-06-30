'use strict';

/* Directives */


angular.module('projectAdmin.directives', ["jsonRpc"]).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
  // Typeahead
  .directive('typeahead', ["$timeout", function($timeout) {
		return {
			restrict : 'E',
			transclude : true,
			replace : true,
			template : '<div><form><input ng-model="term" ng-change="query()" type="text" autocomplete="off" /></form><div ng-transclude></div></div>',
			scope : {
				search : "&",
				select : "&",
				items : "=",
				term : "="
			},
			controller : [
				"$scope",	
				function($scope) {
					$scope.items = [];
					$scope.hide = false;
					this.activate = function(item) {
						$scope.active = item;
					};
					this.activateNextItem = function() {
						var index = $scope.items.indexOf($scope.active);
						this.activate($scope.items[(index + 1) % $scope.items.length]);
					};
					this.activatePreviousItem = function() {
						var index = $scope.items.indexOf($scope.active);
						this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
					};
					this.isActive = function(item) {
						return $scope.active === item;
					};
					this.selectActive = function() {
						this.select($scope.active);
					};
					this.select = function(item) {
						$scope.hide = true;
						$scope.focused = true;
						$scope.select({
							item : item
						});
					};
					$scope.isVisible = function() {
						return !$scope.hide && ($scope.focused || $scope.mousedOver);
					};
					$scope.query = function() {
						$scope.hide = false;
						$scope.search({
							term : $scope.term
						});
					};
				}
			],
			link : function(scope, element, attrs, controller) {
				var $input = element.find('form > input');
				var $list = element.find('> div');
				$input.bind('focus', function() {
					scope.$apply(function() {
						scope.focused = true;
					});
				});
				$input.bind('blur', function() {
					scope.$apply(function() {
						scope.focused = false;
					});
				});
				$list.bind('mouseover', function() {
					scope.$apply(function() {
						scope.mousedOver = true;
					});
				});
				$list.bind('mouseleave', function() {
					scope.$apply(function() {
						scope.mousedOver = false;
					});
				});
				$input.bind('keyup', function(e) {
					if (e.keyCode === 9 || e.keyCode === 13) {
						scope.$apply(function() {
							controller.selectActive();
						});
					}
					if (e.keyCode === 27) {
						scope.$apply(function() {
							scope.hide = true;
						});
					}
				});
				$input.bind('keydown', function(e) {
					if (e.keyCode === 9
					||  e.keyCode === 13
					||  e.keyCode === 27) {
						e.preventDefault();
					}
					if (e.keyCode === 40) {
						e.preventDefault();
						scope.$apply(function() {
							controller.activateNextItem();
						});
					}
					if (e.keyCode === 38) {
						e.preventDefault();
						scope.$apply(function() {
							controller.activatePreviousItem();
						});
					}
				});
				scope.$watch('items', function(items) {
					controller.activate(items.length ? items[0] : null);
				});
				scope.$watch('focused', function(focused) {
					if (focused) {
						$timeout(function() {
							$input.focus();
						}, 0, false);
					}
				});
				scope.$watch('isVisible()',function(visible) {
					if (visible) {
						var pos = $input.position();
						var height = $input[0].offsetHeight;
						$list.css({
							top : pos.top + height,
							left : pos.left,
							position : 'absolute',
							display : 'block'
						});
					} else {
						$list.css('display', 'none');
					}
				});
			}
		};
  }])
  .directive('typeaheadItem', function() {
	return {
		require : '^typeahead',
		link : function(scope, element, attrs, controller) {

			var item = scope.$eval(attrs.typeaheadItem);

			scope.$watch(function() {
				return controller.isActive(item);
			}, function(active) {
				if (active) {
					element.addClass('active');
				} else {
					element.removeClass('active');
				}
			});

			element.bind('mouseenter', function(e) {
				scope.$apply(function() {
					controller.activate(item);
				});
			});

			element.bind('click', function(e) {
				scope.$apply(function() {
					controller.select(item);
				});
			});
		}
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
