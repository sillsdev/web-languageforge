import * as angular from 'angular';

import {LexiconSendReceiveService} from '../../core/lexicon-send-receive.service';
import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController} from '../lexicon-new-project.component';

export class NewProjectSendReceiveCloneController implements angular.IController {
  cloneNotice = this.sendReceive.cloneNotice;

  static $inject = ['lexSendReceive'];
  constructor(private readonly sendReceive: LexiconSendReceiveService) { }

}

export const NewProjectSendReceiveCloneComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: NewProjectSendReceiveCloneController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/send-receive/new-project-clone.component.html'
};

export const NewProjectSendReceiveCloneState = {
  url: '/new-project-nonsr-clone',
  name: 'newProject.sendReceiveClone',
  template: `<new-project-send-receive-clone></new-project-send-receive-clone>`,
  data: {
    step: 2,
    isSRProject: true,
    show: {
      backButton: false,
      nextButton: false,
      step3: false
    },
    nextButtonLabel: 'Get Started',
    progressIndicatorStep1Label: 'Connect',
    progressIndicatorStep2Label: 'Verify',
    progressIndicatorStep3Label: '',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      if (controller.sendReceive.isInProgress()) {
        return controller.error();
      }
      return controller.ok();
    },
    goNextState(controller: LexiconNewProjectController): void {
      if (!controller.sendReceive.isInProgress()) {
        controller.gotoEditor();
      }
    },
    goPreviousState(): void {
    }
  }
} as LexiconNewProjectState;
