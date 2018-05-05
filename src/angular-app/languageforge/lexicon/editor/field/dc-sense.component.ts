import * as angular from 'angular';

import {FieldExampleModule} from './dc-example.component';
import {FieldRepeatModule} from './dc-fieldrepeat.component';

export const FieldSenseModule = angular
  .module('palaso.ui.dc.sense', [FieldExampleModule, FieldRepeatModule])

  // Palaso UI Dictionary Control: Sense
  .directive('dcSense', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-sense.component.html',
    scope: {
      config: '=',
      model: '=',
      index: '=',
      remove: '=',
      control: '='
    },
    controller: ['$scope', '$state', 'modalService', 'lexUtils', ($scope, $state, utils, modal) => {
      $scope.$state = $state;
      $scope.contextGuid = 'sense#' + $scope.model.guid;

      $scope.addExample = function addExample(): void {
        const newExample = {};
        $scope.control.makeValidModelRecursive($scope.config.fields.examples, newExample);
        $scope.model.examples.push(newExample);
        $scope.control.hideCommentsPanel();
      };

      $scope.deleteExample = function deleteExample(index: number): void {
        const deletemsg = 'Are you sure you want to delete the example <b>\' ' +
          utils.constructor.getExample($scope.control.config, $scope.config.fields.examples,
            $scope.model.examples[index], 'sentence')
          + ' \'</b>';
        modal.showModalSimple('Delete Example', deletemsg, 'Cancel', 'Delete Example')
          .then(() => {
            $scope.model.examples.splice(index, 1);
            $scope.control.hideCommentsPanel();
          }, angular.noop);
      };

      angular.forEach($scope.control.config.entry.fields.senses.fields, field => {
        if (!angular.isDefined(field.senseLabel)) {
          field.senseLabel = [];
          field.senseLabel[-1] = 'Meaning';
        }

        field.senseLabel[$scope.index] = 'Meaning ' + ($scope.index + 1);
      });
    }]
  })])
  .name;
