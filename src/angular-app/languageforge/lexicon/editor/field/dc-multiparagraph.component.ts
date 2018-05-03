import * as angular from 'angular';

import {SessionService} from '../../../../bellows/core/session.service';
import {LexiconProjectSettings} from '../../shared/model/lexicon-project-settings.model';

export const FieldMultiParagraphModule = angular
  .module('palaso.ui.dc.multiparagraph', [])

  // Dictionary Control Multitext
  .directive('dcMultiparagraph', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multiparagraph.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      selectField: '&',
      fieldName: '='
    },
    controller: ['$scope', '$state', 'sessionService', ($scope, $state, sessionService: SessionService) => {
      $scope.$state = $state;
      $scope.contextGuid = $scope.$parent.contextGuid;

      sessionService.getSession().then(session => {
        $scope.inputSystems = session.projectSettings<LexiconProjectSettings>().config.inputSystems;

        $scope.inputSystemDirection = function inputSystemDirection(tag: string): string {
          if (!(tag in $scope.inputSystems)) {
            return 'ltr';
          }

          return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
        };
      });

      $scope.modelContainsSpan = function modelContainsSpan() {
        if (angular.isUndefined($scope.model)) {
          return false;
        }

        return $scope.model.paragraphsHtml.indexOf('</span>') > -1;
      };

    }]
  })])
  .name;
