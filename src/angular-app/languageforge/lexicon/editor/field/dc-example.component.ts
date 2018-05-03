import * as angular from 'angular';

export const FieldExampleModule = angular
  .module('palaso.ui.dc.example', [])

  // Palaso UI Dictionary Control: Example Sentence
  .directive('dcExample', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-example.component.html',
    scope: {
      config: '=',
      model: '=',
      index: '=',
      remove: '=',
      control: '='
    },
    controller: ['$scope', '$state', ($scope, $state) => {
      $scope.$state = $state;
      $scope.contextGuid = $scope.$parent.contextGuid + ' example#' + $scope.model.guid;

      angular.forEach($scope.control.config.entry.fields.senses.fields.examples.fields, field => {
        if (!angular.isDefined(field.senseLabel)) {
          field.senseLabel = [];
          field.senseLabel[-1] = 'Example';
        }

        field.senseLabel[$scope.index] = 'Example ' + ($scope.index + 1);
      });
    }]
  })])
  .name;
