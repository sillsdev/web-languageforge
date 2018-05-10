import * as angular from 'angular';

import {FieldMultiParagraphModule} from './dc-multiparagraph.component';
import {FieldPictureModule} from './dc-picture.component';
import {FieldSemanticDomainModule} from './dc-semanticdomain.component';

export const FieldRepeatModule = angular
  .module('palaso.ui.dc.fieldrepeat', [FieldSemanticDomainModule, FieldPictureModule, FieldMultiParagraphModule])

  // Palaso UI Dictionary Control: Sense
  .directive('dcFieldrepeat', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-fieldrepeat.component.html',
    scope: {
      config: '=',
      model: '=',
      control: '='
    },
    controller: ['$scope', '$state', 'lexConfigService',
      ($scope, $state, lexConfigService) => {
        $scope.$state = $state;
        $scope.fieldContainsData = lexConfigService.fieldContainsData;
        $scope.contextGuid = $scope.$parent.contextGuid;

        const unregister = $scope.$watch($scope.control.config, () => {
          if (angular.isDefined($scope.control.config)) {
            $scope.optionlists = $scope.control.config.optionlists;
            unregister();
          }
        });
      }]
  })])
  .name;
