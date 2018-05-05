import * as angular from 'angular';

import {SessionService} from '../../../../bellows/core/session.service';
import {LexiconProjectSettings} from '../../shared/model/lexicon-project-settings.model';

export const FieldRenderedModule = angular
  .module('palaso.ui.dc.rendered', [])

  // Palaso UI Rendered Definition
  .directive('dcRendered', [() => ({
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-rendered.component.html',
    scope: {
      config: '=',
      globalConfig: '=',
      model: '=',
      hideIfEmpty: '=?'
    },
    controller: ['$scope', 'sessionService', 'lexUtils',
    ($scope, sessionService: SessionService, utils) => {
      $scope.render = () => {
        let sense: any;
        let lastPos: string;
        let pos: string;
        $scope.entry = {
          word: '',
          senses: []
        };
        $scope.entry.word = utils.constructor.getCitationForms($scope.globalConfig, $scope.config,
          $scope.model);
        sessionService.getSession().then(session => {
          const optionlists = session.projectSettings<LexiconProjectSettings>().optionlists;
          angular.forEach($scope.model.senses, senseModel => {
            pos = utils.constructor.getPartOfSpeechAbbreviation(senseModel.partOfSpeech,
              optionlists);

            // do not repeat parts of speech
            if (lastPos === pos) {
              pos = '';
            } else {
              lastPos = pos;
            }

            sense = {
              meaning: utils.constructor.getMeanings($scope.globalConfig,
                $scope.config.fields.senses, senseModel),
              partOfSpeech: pos,
              examples: []
            };
            angular.forEach(senseModel.examples, exampleModel => {
              sense.examples.push({
                sentence: utils.constructor.getExample($scope.globalConfig,
                  $scope.config.fields.senses.fields.examples, exampleModel, 'sentence')
              }, {
                sentenceTranslation: utils.constructor.getExample($scope.globalConfig,
                  $scope.config.fields.senses.fields.examples, exampleModel, 'translation')
              });
            });

            $scope.entry.senses.push(sense);
          });
        });
      };

      $scope.makeValidModel = () => {
        // if the model doesn't exist, create an object for it based upon the
        // definition
        if (!$scope.model) {
          $scope.model = {
            senses: []
          };
        }
      };
    }],

    link(scope: any) {
      if (angular.isUndefined(scope.hideIfEmpty)) {
        scope.hideIfEmpty = false;
      }

      scope.$watch('model', () => {
        scope.makeValidModel();
        scope.render();
      }, true); // deep watch
    }
  })])
  .name;
