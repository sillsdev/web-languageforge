'use strict';

import * as angular from 'angular';

class TranslateConfig {
  isTranslationDataShared: boolean;
}

class TranslateProject {
  config: TranslateConfig;
}

export const LanguagesPickerComponent = {
  bindings: {
    tlpProject: '<?',
    tlpUpdateLanguage: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/shared/languages-picker.component.html',
  controller: ['$uibModal', function ($modal: any) {
    this.tlpProject= this.tlpProject  || new TranslateProject();
    this.tlpProject.config = this.tlpProject.config || new TranslateConfig();
    if (angular.isUndefined(this.tlpProject.config.isTranslationDataShared) ||
      this.tlpProject.config.isTranslationDataShared === ''
    ) {
      this.tlpProject.config.isTranslationDataShared = true;
    }

    this.displayLanguage = function displayLanguage(tag: string, languageName: string) {
      if (languageName) {
        return languageName + ' (' + tag + ')';
      }

      return '';
    };

    this.openLanguageModal = function (type: string) {
      let modalInstance = $modal.open({
        templateUrl: '/angular-app/languageforge/translate/shared/select-language.modal.html',
        controller: ['$scope', '$uibModalInstance', function ($scope: any, $modalInstance: any) {
          let typeNames = { source: 'Source', target: 'Target' };
          $scope.typeName = typeNames[type];
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.select = function () {
            $modalInstance.close($scope.selected);
          };
        }],

        windowTopClass: 'modal-select-language'
      });
      modalInstance.result.then(function (selected: any) {
        (this.tlpUpdateLanguage || angular.noop)({
          docType: type,
          code: selected.code,
          language: selected.language
        });
      }.bind(this));
    };

  }]
};
