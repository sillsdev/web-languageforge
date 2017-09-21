import * as angular from 'angular';

// This directive's code is from
// http://stackoverflow.com/questions/14833326/how-to-set-focus-in-angularjs
export const PuiAutoFocus = ($interval: angular.IIntervalService, $parse: angular.IParseService) => (<angular.IDirective> {
  restrict: 'A',
  link($scope, $element, $attrs) {
    let model = $parse($attrs.puiAutoFocus);
    $scope.$watch(model, (newValue) => {
      if (!newValue) {
        return;
      }
      $interval(() => $element[0].focus(), 0, 1);
    });

    // to address @blesh's comment, set attribute value to 'false' on blur event
    if (typeof model.assign === 'function') {
      $element.bind('blur', () => $scope.$apply(model.assign($scope, false)));
    }
  }
});

PuiAutoFocus.$inject = ['$interval', '$parse'];
