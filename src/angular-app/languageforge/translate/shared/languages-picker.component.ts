import * as angular from 'angular';

import { ModalService } from '../../../bellows/core/modal/modal.service';

class TranslateConfig {
  isTranslationDataShared?: boolean | string;
}

class TranslateProject {
  config?: TranslateConfig;
}

export class LanguagesPickerController implements angular.IController {
  tlpProject: TranslateProject;
  tlpUpdateLanguage: (...args: any[]) => void;

  static $inject = ['$uibModal'];
  constructor(private $modal: ModalService) {}

  $onChanges() {
    this.tlpProject = this.tlpProject || new TranslateProject();
    this.tlpProject.config = this.tlpProject.config || new TranslateConfig();
    if (angular.isUndefined(this.tlpProject.config.isTranslationDataShared) ||
      this.tlpProject.config.isTranslationDataShared === ''
    ) {
      this.tlpProject.config.isTranslationDataShared = true;
    }
  }

  displayLanguage(tag: string, languageName: string) {
    if (languageName) {
      return languageName + ' (' + tag + ')';
    }

    return '';
  };

  openLanguageModal(type: string) {
    let modalInstance = this.$modal.open({
      templateUrl: '/angular-app/languageforge/translate/shared/select-language.modal.html',
      controller: ['$scope', '$uibModalInstance', function (
        $scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService
      ) {
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
    modalInstance.result.then((selected: any) => {
      if (this.tlpUpdateLanguage) this.tlpUpdateLanguage({
        docType: type,
        code: selected.code,
        language: selected.language
      });
    });
  };

}

export const LanguagesPickerComponent: angular.IComponentOptions = {
  bindings: {
    tlpProject: '<?',
    tlpUpdateLanguage: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/shared/languages-picker.component.html',
  controller: LanguagesPickerController
};
