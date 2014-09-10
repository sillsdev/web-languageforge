"use strict";

angular.module('palaso.ui.dc.sense', ['palaso.ui.dc.multitext', 'palaso.ui.dc.optionlist', 'palaso.ui.dc.multioptionlist', 'palaso.ui.dc.example', 'ngAnimate', 'bellows.services', 'lexicon.services'])
// Palaso UI Dictionary Control: Sense
.directive('dcSense', ['lexUtils', 'modalService', function(utils, modal) {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/directive/dc-sense.html',
    scope: {
      config: "=",
      model: "=",
      index: "=",
      remove: "=",
      control: "="
    },
    controller: ['$scope', 'lexConfigService', function($scope, lexConfigService) {
      $scope.addExample = function addExample() {
        var newExample = {};
        $scope.control.makeValidModelRecursive($scope.config.fields.examples, newExample);
        $scope.model.examples.push(newExample);
      };
      
      $scope.addPicture = function addPicture() {
        var newPicture = {};
        $scope.control.makeValidModelRecursive($scope.config.fields.pictures, newPicture);
        $scope.model.pictures.push(newPicture);
      };
      
      $scope.pictureUrl = function pictureUrl(fileName) {
        return '/assets/lexicon/' + $scope.control.project.slug + '/' + fileName;
      };

      $scope.deleteExample = function deleteExample(index) {
        var deletemsg = "Are you sure you want to delete the example <b>' " + utils.getExampleSentence($scope.config.fields.examples, $scope.model.examples[index]) + " '</b>";
        modal.showModalSimple('Delete Example', deletemsg, 'Cancel', 'Delete Example').then(function() {
          $scope.model.examples.splice(index, 1);
        });
      };

      $scope.fieldContainsData = lexConfigService.fieldContainsData;
    }],
    link: function(scope, element, attrs, controller) {
      scope.optionlists = scope.control.config.optionlists;

    }
  };
}]);
