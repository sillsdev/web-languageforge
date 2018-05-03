'use strict';

angular.module('palaso.ui.dc.rendered', [])

// Palaso UI Rendered Definition
.directive('dcRendered', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-rendered.component.html',
    scope: {
      config: '=',
      globalConfig: '=',
      model: '=',
      hideIfEmpty: '=?'
    },
    controller: ['$scope', 'sessionService', 'lexUtils',
      function ($scope, sessionService, utils) {
      $scope.render = function () {
        var sense;
        var lastPos;
        var pos;
        $scope.entry = {
          word: '',
          senses: []
        };
        $scope.entry.word = utils.constructor.getCitationForms($scope.globalConfig, $scope.config,
          $scope.model);
        sessionService.getSession().then(function (session) {
          var optionlists = session.projectSettings().optionlists;
          angular.forEach($scope.model.senses, function (senseModel) {
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
            angular.forEach(senseModel.examples, function (exampleModel) {
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

      $scope.makeValidModel = function () {
        // if the model doesn't exist, create an object for it based upon the
        // definition
        if (!$scope.model) {
          $scope.model = {
            senses: []
          };
        }
      };
    }],

    link: function (scope) {
      if (angular.isUndefined(scope.hideIfEmpty)) {
        scope.hideIfEmpty = false;
      }

      scope.$watch('model', function () {
        scope.makeValidModel();
        scope.render();
      }, true); // deep watch
    }
  };
}]);
