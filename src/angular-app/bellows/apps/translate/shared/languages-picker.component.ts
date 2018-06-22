import * as angular from 'angular';

import {ModalService} from '../../../core/modal/modal.service';
import {TranslateConfig} from './model/translate-config.model';
import {TranslateProject} from './model/translate-project.model';

export class LanguagesPickerController implements angular.IController {
  tlpProject: TranslateProject;
  tlpUpdateLanguage: (...args: any[]) => void;

  static $inject = ['$uibModal'];
  constructor(private $modal: ModalService) {}

  $onChanges() {
    this.tlpProject = this.tlpProject || {} as TranslateProject;
    this.tlpProject.config = this.tlpProject.config || new TranslateConfig();
    if (this.tlpProject.config.isTranslationDataShared == null ||
      this.tlpProject.config.isTranslationDataShared === ''
    ) {
      this.tlpProject.config.isTranslationDataShared = false;
    }
  }

  // noinspection JSMethodCanBeStatic
  displayLanguage(tag: string, languageName: string) {
    if (languageName) {
      return languageName + ' (' + tag + ')';
    }

    return '';
  }

  openLanguageModal(type: string) {
    const modalInstance = this.$modal.open({
      templateUrl: '/angular-app/bellows/apps/translate/shared/select-language.modal.html',
      controller: ['$scope', '$uibModalInstance', (
        $scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService
      ) => {
        const typeNames = { source: 'Source', target: 'Target' };
        $scope.typeName = typeNames[type];
        $scope.selected = {
          code: '',
          language: {}
        };
        $scope.select = () => {
          $modalInstance.close($scope.selected);
        };
      }],

      windowTopClass: 'modal-select-language'
    });
    modalInstance.result.then((selected: any) => {
      if (this.tlpUpdateLanguage) {
        this.tlpUpdateLanguage({
          docType: type,
          code: selected.code,
          language: selected.language
        });
      }
    }, () => { });
  }
}

export const LanguagesPickerComponent: angular.IComponentOptions = {
  bindings: {
    tlpProject: '<?',
    tlpUpdateLanguage: '&'
  },
  templateUrl: '/angular-app/bellows/apps/translate/shared/languages-picker.component.html',
  controller: LanguagesPickerController
};
