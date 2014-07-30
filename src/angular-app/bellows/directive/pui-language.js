'use strict';

angular.module('palaso.ui.language', [])
  
  // Palaso UI Select Language 
  .directive('puiSelectLanguage', [function() {
    return {
      restrict : 'E',
      transclude: true,
      templateUrl : '/angular-app/bellows/directive/pui-language.html',
      scope : {
        puiCode : "=",
        puiLanguage : "=",
        puiAddDisabled : "=",
        puiSuggestedLanguages : "=",
        puiShowLinks : "="
      },
      controller: ['$scope', '$filter', function($scope, $filter) {
        
        // TODO Enhance. Could use infinite scrolling since search can return large results. See example here http://jsfiddle.net/W6wJ2/. IJH 2014-02
        $scope.languages = InputSystems.languages();
        $scope.currentCode = '';
        $scope.puiAddDisabled = true;
        $scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
        
        $scope.search = function search() {
          $scope.filterText = $scope.searchText;
          if ($scope.searchText == '*') {
            $scope.filterText = '';
          }
        };
        $scope.clearSearch = function clearSearch() {
          $scope.searchText = '';
          $scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
          delete $scope.languages;
          $scope.languages = InputSystems.languages();
          $scope.showSuggestions = false;
        };
        
        $scope.selectLanguage = function(language) {
          $scope.currentCode = language.code.three;
          $scope.puiCode = (language.code.two) ? language.code.two : language.code.three;
          $scope.puiLanguage = language;
          $scope.puiAddDisabled = false;
        };
        
        $scope.suggest = function suggest() {
          delete $scope.languages;
          $scope.languages = $scope.puiSuggestedLanguages;
          $scope.filterText = '';
          $scope.showSuggestions = true;
        };
        
      }]
    };
  }])
  ;
