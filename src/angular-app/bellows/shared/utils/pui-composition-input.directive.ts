import * as angular from 'angular';

// tslint:disable-next-line:max-line-length
// see http://stackoverflow.com/questions/27663149/angularjs-trigger-ng-change-ng-keyup-or-scope-watch-while-composing-korean-c
// this might not work on firefox.  See link above for alternate code

// Angular's ng-change, ng-keyup and $scope.$watch don't get triggered
// while composing (e.g. when writing Korean syllables).
// See: https://github.com/angular/angular.js/issues/10588
// This custom directive uses element.on('input') instead, which gets
// triggered while composing.
export const PuiCompositionInput = () => ({
  restrict: 'A',
  require: '^ngModel',
  link($scope: any, $element, $attrs) {
    $element.on('input', () => {
      $scope.$apply(() => {
        $scope.ngModel = $element.val();
        // only works if no scope has been defined in directive
        $scope.$eval($attrs.cstInput, { answer: $scope.ngModel });
      });
    });
  }
} as angular.IDirective);
