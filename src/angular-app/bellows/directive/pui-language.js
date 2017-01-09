'use strict';

angular.module('palaso.ui.language', [])

  // Palaso UI Select Language
  .directive('puiSelectLanguage', [function () {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/pui-language.html',
      scope: {
        puiCode: '=',
        puiLanguage: '=',
        puiAddDisabled: '=',
        puiSuggestedLanguageCodes: '=',
        puiShowLinks: '='
      },
      controller: ['$scope', '$filter', function ($scope, $filter) {

        // TODO Enhance. Could use infinite scrolling since search can return large results.
        // See example here http://jsfiddle.net/W6wJ2/. IJH 2014-02
        $scope.currentCode = '';
        $scope.puiAddDisabled = true;
        $scope.filterText = 'xXxXxXxXxXxDoesntExistxXxXxXxXxXx';
        $scope.allLanguages = InputSystems.languages();

        // Sort languages with two-letter codes first, then three-letter codes
        $scope.buildLanguageList = function () {
          var result = [];
          angular.forEach($scope.allLanguages, function (language) {
            if (angular.isDefined(language.code.two)) {
              result.push(language);
            }
          });

          angular.forEach($scope.allLanguages, function (language) {
            if (angular.isUndefined(language.code.two)) {
              result.push(language);
            }
          });

          return result;
        };

        $scope.languages = $scope.buildLanguageList();
        $scope.suggestedLanguages = [];
        angular.forEach($scope.puiSuggestedLanguageCodes, function (code) {
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
          $scope.languages = $scope.buildLanguageList();
          $scope.showSuggestions = false;
        };

        $scope.selectLanguage = function (language) {
          $scope.currentCode = language.code.three;
          $scope.puiCode = (language.code.two) ? language.code.two : language.code.three;
          $scope.puiLanguage = language;
          $scope.puiAddDisabled = false;
        };

        $scope.suggest = function suggest() {
          delete $scope.languages;
          $scope.languages = $scope.buildLanguageList();
          $scope.filterText = '';
          $scope.showSuggestions = true;
        };

      }]
    };
  }])

  ;
