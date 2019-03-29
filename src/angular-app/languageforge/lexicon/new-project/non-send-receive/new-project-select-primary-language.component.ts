import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController, NewProject} from '../lexicon-new-project.component';
import {NewProjectInitialDataState} from './new-project-initial-data.component';

export class NewProjectSelectPrimaryLanguageController implements angular.IController {
  npsNewProject: NewProject;
  npsValidateForm: () => void;

  static $inject = ['$scope', '$uibModal'];
  constructor(private readonly $scope: angular.IScope, private readonly $modal: ModalService) { }

  $onInit(): void {
    this.$scope.$watch(() => this.npsNewProject.languageCode, (newVal: string) => {
      if (newVal != null) {
        this.npsValidateForm();
      }
    });
  }

  primaryLanguage(): string {
    if (this.npsNewProject.languageCode) {
      return this.npsNewProject.language.name + ' (' + this.npsNewProject.languageCode + ')';
    }

    return '';
  }

  openNewLanguageModal(): void {
    const modalInstance = this.$modal.open({
      templateUrl: '/angular-app/languageforge/lexicon/shared/select-new-language.modal.html',
      controller: ['$scope', '$uibModalInstance',
        ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = () => {
            $modalInstance.close($scope.selected);
          };

          $scope.close = $modalInstance.dismiss;
        }
      ],
      windowTopClass: 'modal-select-language'
    });
    modalInstance.result.then(selected => {
      this.npsNewProject.languageCode = selected.code;
      this.npsNewProject.language = selected.language;
    }, () => {});
  }

}

export const NewProjectSelectPrimaryLanguageComponent: angular.IComponentOptions = {
  bindings: {
    npsNewProject: '=',
    npsValidateForm: '&'
  },
  controller: NewProjectSelectPrimaryLanguageController,
  templateUrl:
    '/angular-app/languageforge/lexicon/new-project/non-send-receive/new-project-select-primary-language.component.html'
};

export const NewProjectSelectPrimaryLanguageState = {
  name: 'newProject.selectPrimaryLanguage',
  template: `
    <new-project-select-primary-language nps-new-project="$ctrl.newProject" nps-validate-form="$ctrl.validateForm()">
    </new-project-select-primary-language>
  `,
  data: {
    step: 3,
    isSRProject: false,
    show: {
      backButton: true,
      nextButton: true,
      step3: true
    },
    nextButtonLabel: 'Dictionary',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Language',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      if (!controller.newProject.languageCode) {
        return controller.error('Please select a primary language for the project.');
      }

      return controller.ok();
    },
    goNextState(controller: LexiconNewProjectController): void {
      controller.savePrimaryLanguage(controller.gotoEditor);
    },
    goPreviousState(controller: LexiconNewProjectController): void {
      controller.newProject.emptyProjectDesired = false;
      controller.$state.go(NewProjectInitialDataState.name);
    }
  }
} as LexiconNewProjectState;
