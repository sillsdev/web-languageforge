'use strict';

angular.module('palaso.ui.comments')

  // Palaso UI Dictionary Control: Comments
  .directive('regardingField', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/palaso.ui.comments.regarding-field.html',
      scope: {
        content: '=',
        control: '=',
        field: '=',
        fieldConfig: '='
      },
      controller: ['$scope', function ($scope) {
        $scope.contentArr = [];
        $scope.$watch('fieldConfig', function (newContent) {
          if (angular.isDefined(newContent)) {
            $scope.setContent();
          }
        });

        $scope.setContent = function setContent() {
          if (angular.isDefined($scope.fieldConfig)) {
            if (!angular.isUndefined($scope.content)) {
              if ($scope.fieldConfig.type === 'optionlist' ||
                  $scope.fieldConfig.type === 'multioptionlist') {
                if ($scope.field === 'semanticDomain') {
                  // Semantic domains are in the global scope and appear to be English only
                  // Will need to be updated once the system provides support for other languages
                  for (var i in semanticDomains_en) {
                    if (semanticDomains_en[i].key === $scope.content) {
                      $scope.contentArr[0] = semanticDomains_en[i].value;
                    }
                  }
                } else {
                  var optionlists = $scope.control.config.optionlists;
                  for (var listCode in optionlists) {
                    if (listCode === $scope.fieldConfig.listCode) {
                      for (var i in optionlists[listCode].items) {
                        if (optionlists[listCode].items[i].key === $scope.content) {
                          $scope.contentArr[0] = optionlists[listCode].items[i].value;
                        }
                      }
                    }
                  }
                }
              } else {
                $scope.contentArr = $scope.content.split('#');
              }
            }
          }
        };

        $scope.setContent();
      }]
    };
  }]);
