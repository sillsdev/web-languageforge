import * as angular from 'angular';

import {LexConfigField} from '../../shared/model/lexicon-config.model';

interface WindowService extends angular.IWindowService {
  semanticDomains_en?: any;
}

export function RegardingFieldComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/regarding-field.component.html',
    scope: {
      content: '=',
      control: '=',
      field: '=',
      fieldConfig: '='
    },
    controller: ['$scope', '$window', ($scope: any, $window: WindowService) => {
      $scope.regarding = '';
      $scope.$watch('fieldConfig', (newContent: LexConfigField) => {
        if (newContent != null) {
          $scope.setContent();
        }
      });

      $scope.setContent = function setContent(): void {
        if ($scope.fieldConfig != null) {
          if ($scope.content != null) {
            if ($scope.fieldConfig.type === 'optionlist' || $scope.fieldConfig.type === 'multioptionlist') {
              if ($scope.field === 'semanticDomain') {
                // Semantic domains are in the global scope and appear to be English only
                // Will need to be updated once the system provides support for other languages
                for (const i in $window.semanticDomains_en) {
                  if ($window.semanticDomains_en.hasOwnProperty(i) &&
                    $window.semanticDomains_en[i].key === $scope.content
                  ) {
                    $scope.regarding = $window.semanticDomains_en[i].value;
                  }
                }
              } else {
                const optionlists = $scope.control.config.optionlists;
                for (const listCode in optionlists) {
                  if (optionlists.hasOwnProperty(listCode) && listCode === $scope.fieldConfig.listCode) {
                    for (const i in optionlists[listCode].items) {
                      if (optionlists[listCode].items.hasOwnProperty(i) &&
                        optionlists[listCode].items[i].key === $scope.content
                      ) {
                        $scope.regarding = optionlists[listCode].items[i].value;
                      }
                    }
                  }
                }
              }
            } else {
              $scope.regarding = $scope.content;
            }
          }
        }
      };

      $scope.setContent();
    }]
  };
}
