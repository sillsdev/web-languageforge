import * as angular from 'angular';

import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {LexiconNewProjectState} from './lexicon-new-project-state.model';
import {LexiconNewProjectController} from './lexicon-new-project.component';
import {NewProjectNameState} from './non-send-receive/new-project-name.controller';

export class NewProjectChooserController implements angular.IController {
  npcInterfaceConfig: InterfaceConfig;
  npcGetProjectFromInternet: () => void;

  static $inject = ['$state'];
  constructor(private readonly $state: angular.ui.IStateService) { }

  createNew(): void {
    this.$state.go(NewProjectNameState.name);
  }

}

export const NewProjectChooserComponent: angular.IComponentOptions = {
  bindings: {
    npcInterfaceConfig: '<',
    npcGetProjectFromInternet: '&'
  },
  controller: NewProjectChooserController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/new-project-chooser.component.html'
};

export const NewProjectChooserState = {
  name: 'newProject.chooser',
  template: `
    <new-project-chooser
      npc-interface-config="$ctrl.interfaceConfig"
      npc-get-project-from-internet="$ctrl.getProjectFromInternet()">
    </new-project-chooser>
  `,
  data: {
    step: 0,
    isSRProject: false,
    show: {
      backButton: false,
      nextButton: false,
      step3: false
    },
    nextButtonLabel: 'Next',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Verify',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      return controller.error();
    },
    goNextState(): void {
    },
    goPreviousState(): void {
    }
  }
} as LexiconNewProjectState;
