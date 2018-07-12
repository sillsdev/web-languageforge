import * as angular from 'angular';

// from: http://stackoverflow.com/questions/14419651/angularjs-filters-on-ng-model-in-an-input
export function ModelTransformLimit(): angular.IDirective {
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      modelTransformLimit: '@'
    },
    link(scope, element, attrs, modelCtrl: angular.INgModelController) {
      modelCtrl.$parsers.push((inputValue: string): string => {
        let transformedInput = '';
        if (inputValue) {
          transformedInput =
            inputValue.toLowerCase().substring(0, parseInt(attrs.modelTransformLimit, 10));
          if (transformedInput !== inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }
        }

        return transformedInput;
      });
    }
  };
}

// Truncate whitespace
export function ModelTransformNoSpace(): angular.IDirective {
  return {
    restrict: 'A',
    require: 'ngModel',
    link(scope, element, attrs, modelCtrl: angular.INgModelController) {
      modelCtrl.$parsers.push((inputValue: string): string => {
        let transformedInput = '';
        if (inputValue) {
          transformedInput = inputValue.replace(/\s+/g, '');
          if (transformedInput !== inputValue) {
            modelCtrl.$setViewValue(transformedInput);
            modelCtrl.$render();
          }
        }

        return transformedInput;
      });
    }
  };
}

export const ModelTransformModule = angular
  .module('palaso.util.model.transform', [])
  .directive('modelTransformLimit', ModelTransformLimit)
  .directive('modelTransformNoSpace', ModelTransformNoSpace)
  .name;
