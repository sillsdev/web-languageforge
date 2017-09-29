import * as angular from 'angular';

// see http://stackoverflow.com/questions/27663149/angularjs-trigger-ng-change-ng-keyup-or-scope-watch-while-composing-korean-c
// this might not work on firefox.  See link above for alternate code

// Angular's ng-change, ng-keyup and $scope.$watch don't get triggered
// while composing (e.g. when writing Korean syllables).
// See: https://github.com/angular/angular.js/issues/10588
// This custom directive uses element.on('input') instead, which gets
// triggered while composing.
export const PuiCompositionInput = () => (<angular.IDirective> {
  restrict: 'A',
  require: '^ngModel',
  link($scope: any, $element, $attrs, ngModel) {
    $element.on('input', function() {
      $scope.$apply(function(){
        $scope.ngModel = $element.val();
        $scope.$eval($attrs.cstInput, {'answer': $scope.ngModel}); // only works if no scope has been defined in directive
      });
    });
  }
});
