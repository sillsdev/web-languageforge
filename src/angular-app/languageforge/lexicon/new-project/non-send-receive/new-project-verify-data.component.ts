import * as angular from 'angular';

import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController} from '../lexicon-new-project.component';

export class NewProjectVerifyDataController implements angular.IController {
  npvEntriesImported: number;
  npvImportErrors: string;

  showImportErrors: boolean = false;

  hasImportErrors(): boolean {
    return this.npvImportErrors !== '';
  }

  showImportErrorsButtonLabel(): string {
    if (this.showImportErrors) {
      return 'Hide non-critical import errors';
    }

    return 'Show non-critical import errors';
  }

}

export const NewProjectVerifyDataComponent: angular.IComponentOptions = {
  bindings: {
    npvEntriesImported: '<',
    npvImportErrors: '<'
  },
  controller: NewProjectVerifyDataController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/non-send-receive/new-project-verify-data.component.html'
};

export const NewProjectVerifyDataState = {
  name: 'newProject.verifyData',
  template: `
    <new-project-verify-data
      npv-entries-imported="$ctrl.newProject.entriesImported"
      npv-import-errors="$ctrl.newProject.importErrors">
    </new-project-verify-data>`,
  data: {
    step: 3,
    isSRProject: false,
    show: {
      backButton: false,
      nextButton: true,
      step3: true
    },
    nextButtonLabel: 'Dictionary',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Verify',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      return controller.neutral();
    },
    goNextState(controller: LexiconNewProjectController): void {
      controller.gotoEditor();
    },
    goPreviousState(): void {
    }
  }
} as LexiconNewProjectState;
