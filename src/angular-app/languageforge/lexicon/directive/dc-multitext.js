'use strict';

angular.module('palaso.ui.dc.multitext', ['bellows.services', 'palaso.ui.showOverflow',
  'palaso.ui.dc.formattedtext', 'palaso.ui.dc.audio', 'lexicon.services'])

// Dictionary Control Multitext
.directive('dcMultitext', [function () {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-multitext.html',
    scope: {
      config: '=',
      model: '=',
      control: '=',
      fieldName: '=',
      selectField: '&'
    },
    controller: ['$scope', '$state', 'sessionService', 'lexUtils',
    function ($scope, $state, sessionService, lexUtils) {
      $scope.$state = $state;
      $scope.isAudio = lexUtils.isAudio;

      sessionService.getSession().then(function(session) {
        $scope.inputSystems = session.projectSettings().config.inputSystems;

        $scope.inputSystemDirection = function inputSystemDirection(tag) {
          if (!(tag in $scope.inputSystems)) {
            return 'ltr';
          }

          return ($scope.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
        };
      });

      $scope.selectInputSystem = function selectInputSystem(tag) {
        $scope.selectField({
          inputSystem: tag
        });
      };

      $scope.modelContainsSpan = function modelContainsSpan(tag) {
        if (angular.isUndefined($scope.model) || !(tag in $scope.model)) {
          return false;
        }

        var languageSpanPattern = /<span.* lang="/;
        return languageSpanPattern.test($scope.model[tag].value);
      };

      $scope.getFieldId = function getFieldId(fieldName, tag) {
        if (!$scope.control.currentEntry.id || !fieldName) return '';

        return 'entry:' + $scope.control.currentEntry.id + ':' + fieldName + ((tag) ? ':' + tag : '');
      };
      
      $scope.editorCreated = function editorCreated(editor, fieldName, tag) {
        var fieldId = $scope.getFieldId(fieldName, tag)
        window.realTime.createAndSubscribeRichTextDoc(fieldId, editor);
      };
    }]
  };
}]);
