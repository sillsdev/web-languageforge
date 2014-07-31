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
        puiSuggestedLanguageCodes : "=",
        puiShowLinks : "="
      },
      controller: ['$scope', '$filter', function($scope, $filter) {
        
        // TODO Enhance. Could use infinite scrolling since search can return large results. See example here http://jsfiddle.net/W6wJ2/. IJH 2014-02
        $scope.currentCode = '';
        $scope.puiAddDisabled = true;
        $scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
        $scope.allLanguages = InputSystems.languages();
        $scope.languages = $scope.allLanguages;
        $scope.suggestedLanguages = [];
        angular.forEach($scope.puiSuggestedLanguageCodes, function(code) {
          angular.forEach($scope.allLanguages, function (language) {
            if (language.code.two === code || language.code.three === code) {
              $scope.suggestedLanguages.push(language);
              return;
            }
          });
        });
        
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
          $scope.languages = $scope.allLanguages;
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
          $scope.languages = $scope.suggestedLanguages;
          $scope.filterText = '';
          $scope.showSuggestions = true;
        };
        
      }]
    };
  }])
  ;
