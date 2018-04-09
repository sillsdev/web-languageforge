import * as angular from 'angular';

interface IdleValidateScope extends angular.IScope {
  idleValidate: () => { };
  idleValidateKeypress: () => { };
  idleValidateMsec: number;
}

export function PuiIdleValidate($interval: angular.IIntervalService): angular.IDirective {
  return {
    restrict: 'A',
    scope: {
      idleValidate: '&',
      idleValidateKeypress: '&',
      idleValidateMsec: '<'
    },
    link($scope: IdleValidateScope, $element) {
      let intervalTimer: angular.IPromise<any>;
      let milliseconds = $scope.idleValidateMsec;
      if (!angular.isNumber($scope.idleValidateMsec)) {
        milliseconds = 1000;
      }

      $element.bind('keyup', () => {
        if (angular.isFunction($scope.idleValidateKeypress)) {
          $scope.$apply($scope.idleValidateKeypress);
        }

        if (angular.isDefined(intervalTimer)) {
          $interval.cancel(intervalTimer);
        }

        intervalTimer = $interval(() => $scope.idleValidate(), milliseconds, 1);
      });
    }
  };
}
PuiIdleValidate.$inject = ['$interval'];
