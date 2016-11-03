'use strict';

angular.module('palaso.ui.utils', [])
  .directive('idleValidate', ['$interval', function ($interval) {
    return {
      restrict: 'A',
      scope: {
        idleValidate: '&',
        idleValidateKeypress: '&',
        idleValidateMsec: '='
      },
      link: function (scope, element) {
        var intervalTimer;
        var milliseconds = scope.idleValidateMsec;
        if (!angular.isNumber(scope.idleValidateMsec)) {
          milliseconds = 1000;
        }

        element.bind('keyup', function () {
          if (angular.isFunction(scope.idleValidateKeypress)) {
            scope.$apply(scope.idleValidateKeypress);
          }

          if (angular.isDefined(intervalTimer)) {
            $interval.cancel(intervalTimer);
          }

          intervalTimer = $interval(function () { scope.idleValidate(); }, milliseconds, 1);
        });
      }
    };
  }])

  // see http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
  .directive('setFocus', ['$timeout', function ($timeout) {
    return {
      link: function (scope, element, attrs) {
        scope.$watch(attrs.setFocus, function (value) {
          if (value === true) {
            $timeout(function () {
              element[0].focus();

              //scope[attrs.setFocus] = false;
            });
          }
        });
      }
    };
  }])

  // see http://stackoverflow.com/questions/27663149/angularjs-trigger-ng-change-ng-keyup-or-scope-watch-while-composing-korean-c
  // this might not work on firefox.  See link above for alternate code

  // Angular's ng-change, ng-keyup and $scope.$watch don't get triggered
  // while composing (e.g. when writing Korean syllables).
  // See: https://github.com/angular/angular.js/issues/10588
  // This custom directive uses element.on('input') instead, which gets
  // triggered while composing.
  .directive('compositionInput', function() {
    return {
      restrict: 'A',
      require: '^ngModel',
      link: function (scope, element, attrs, ngModel) {
        element.on('input', function() {
          scope.$apply(function(){
            scope.ngModel = element.val();
            scope.$eval(attrs.cstInput, {'answer': scope.ngModel}); // only works if no scope has been defined in directive
          });
        });
      }
    };
  })

;
