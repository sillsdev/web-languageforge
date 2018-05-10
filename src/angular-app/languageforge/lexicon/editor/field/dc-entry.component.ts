import * as angular from 'angular';

import {LexiconRightsService} from '../../core/lexicon-rights.service';
import {FieldRenderedModule} from './dc-rendered.component';
import {FieldSenseModule} from './dc-sense.component';

export const FieldEntryModule = angular
  .module('palaso.ui.dc.entry', [FieldRenderedModule, FieldSenseModule])

  // Palaso UI Dictionary Control: Entry
  .directive('dcEntry', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-entry.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '='
    },
    controller: ['$scope', '$state', 'modalService', 'lexRightsService', 'lexUtils',
      ($scope, $state, modal, rightsService: LexiconRightsService, utils) => {
        $scope.$state = $state;
        $scope.contextGuid = '';
        $scope.fieldName = 'entry';

        rightsService.getRights().then(rights => {
          $scope.rights = rights;
        });

        $scope.addSense = function addSense($position: number): void {
          const newSense = {};
          $scope.control.makeValidModelRecursive($scope.config.fields.senses, newSense, 'examples');
          if ($position === 0) {
            $scope.model.senses.unshift(newSense);
          } else {
            $scope.model.senses.push(newSense);
          }

          $scope.control.hideRightPanel();
        };

        $scope.deleteSense = function deleteSense(index: number): void {
          const deletemsg = 'Are you sure you want to delete the meaning <b>\' ' +
            utils.constructor.getMeaning($scope.config, $scope.config.fields.senses, $scope.model.senses[index]) +
            ' \'</b>';
          modal.showModalSimple('Delete Meaning', deletemsg, 'Cancel', 'Delete Meaning')
            .then(() => {
              $scope.model.senses.splice(index, 1);
              $scope.control.saveCurrentEntry();
              $scope.control.hideRightPanel();
            }, angular.noop);
        };

        $scope.deleteEntry = function deleteEntry(): void {
          $scope.control.deleteEntry($scope.control.currentEntry);
        };

        angular.forEach($scope.control.config.entry.fields, field => {
          field.senseLabel = 'Entry';
        });
      }]
  })])
  .name;
