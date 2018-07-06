import * as angular from 'angular';

import {LexiconNewProjectController} from './lexicon-new-project.controller';

export interface LexiconNewProjectState extends angular.ui.IState {
  data: LexiconNewProjectStateData;
}

export interface LexiconNewProjectStateData {
  step: number;
  isSRProject: boolean;
  show: LexiconNewProjectStateDataShow;
  nextButtonLabel: string;
  progressIndicatorStep1Label: string;
  progressIndicatorStep2Label: string;
  progressIndicatorStep3Label: string;
  isFormValid: (controller?: LexiconNewProjectController) => angular.IPromise<boolean>;
  goNextState: (controller?: LexiconNewProjectController) => void;
  goPreviousState: (controller?: LexiconNewProjectController) => void;
}

export interface LexiconNewProjectStateDataShow {
  backButton: boolean;
  nextButton: boolean;
  step3: boolean;
}

export const LexiconNewProjectAbstractState = {
  name: 'newProject',
  abstract: true,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-abstract.html',
  controller: 'NewLexiconProjectCtrl',
  controllerAs: '$ctrl'
} as angular.ui.IState;

export const LexiconNewProjectChooserState = {
  name: 'newProject.chooser',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-chooser.html',
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
    goNextState(): void { },
    goPreviousState(): void { }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectNameState = {
  name: 'newProject.name',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-name.html',
  data: {
    step: 1,
    isSRProject: false,
    show: {
      backButton: true,
      nextButton: true,
      step3: true
    },
    nextButtonLabel: 'Next',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Verify',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      if (!controller.newProject.projectName) {
        return controller.error('Project Name cannot be empty. Please enter a project name.');
      }

      if (!controller.newProject.projectCode) {
        return controller.error('Project Code cannot be empty. ' +
          'Please enter a project code or uncheck "Edit project code".');
      }

      if (!controller.newProject.appName) {
        return controller.error('Please select a project type.');
      }

      if (controller.projectCodeState === 'unchecked') {
        controller.checkProjectCode();
      }

      return controller.projectCodeStateDefer.promise.then(() => {
        switch (controller.projectCodeState) {
          case 'ok':
            return controller.ok();
          case 'exists':
            return controller.error('Another project with code \'' + controller.newProject.projectCode +
              '\' already exists.');
          case 'invalid':
            return controller.error('Project Code must begin with a letter, ' +
              'and only contain lower-case letters, numbers, dashes and underscores.');
          case 'loading':
            return controller.error();
          case 'empty':
            return controller.neutral();
          default:

            // Project code state is unknown. Give a generic message,
            // adapted based on whether the user checked "Edit project code" or not.
            if (controller.newProject.editProjectCode) {
              return controller.error('Project code \'' + controller.newProject.projectCode +
                '\' cannot be used. Please choose a new project code.');
            } else {
              return controller.error('Project code \'' + controller.newProject.projectCode +
                '\' cannot be used. Either change the project name, ' +
                'or check the "Edit project code" box and choose a new code.');
            }
        }
      });
    },
    goNextState(controller: LexiconNewProjectController): void {
      controller.createProject();
      controller.$state.go(LexiconNewProjectInitialDataState.name);
      controller.projectCodeState = 'empty';
      controller.projectCodeStateDefer = controller.$q.defer();
      controller.projectCodeStateDefer.resolve('empty');
      controller.neutral();
    },
    goPreviousState(controller: LexiconNewProjectController): void {
      controller.$state.go(LexiconNewProjectChooserState.name);
    }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSendReceiveCredentialsState = {
  name: 'newProject.sendReceiveCredentials',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-credentials.html',
  data: {
    step: 1,
    isSRProject: true,
    show: {
      backButton: true,
      nextButton: true,
      step3: false
    },
    nextButtonLabel: 'Get Started',
    progressIndicatorStep1Label: 'Connect',
    progressIndicatorStep2Label: 'Verify',
    progressIndicatorStep3Label: '',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      if (controller.project.sendReceive.project != null && controller.project.sendReceive.project.isLinked) {
        controller.$state.current.data.nextButtonLabel = 'Join Project';
      } else {
        controller.$state.current.data.nextButtonLabel = 'Get Started';
      }

      controller.project.sendReceive.projectStatus = 'unchecked';
      if (!controller.project.sendReceive.username) {
        return controller.error('Login cannot be empty. Please enter your LanguageDepot.org login username.');
      }

      if (!controller.project.sendReceive.password) {
        return controller.error('Password cannot be empty. Please enter your LanguageDepot.org password.');
      }

      if (controller.project.sendReceive.isUnchecked) {
        return controller.neutral();
      }

      if (controller.project.sendReceive.credentialsStatus === 'invalid') {
        return controller.error('The username or password isn\'t valid on LanguageDepot.org.');
      }

      controller.project.sendReceive.projectStatus = 'no_access';
      if (!controller.project.sendReceive.project) {
        return controller.error('Please select a Project.');
      }

      if (!controller.project.sendReceive.project.isLinked &&
        controller.project.sendReceive.project.role !== 'manager') {
        return controller.error('Please select a Project that you are the Manager of on LanguageDepot.org.');
      }

      controller.project.sendReceive.projectStatus = 'ok';
      return controller.ok();
    },
    goNextState(controller: LexiconNewProjectController): void {
      // For now, this is the point of no return.  We can't cancel an LfMerge clone, and we don't want the user to go to
      // the project and start editing before the clone has completed.
      controller.show.cloning = true;
      controller.resetValidateProjectForm();
      if (controller.project.sendReceive.project.isLinked) {
        let role = 'contributor';
        if (controller.project.sendReceive.project.role === 'manager') {
          role = 'project_manager';
        }

        controller.projectService.joinSwitchSession(controller.project.sendReceive.project.identifier, role)
          .then(result => {
            if (result.ok) {
              controller.newProject.id = result.data;
              controller.sessionService.getSession(true).then(controller.gotoEditor);
            } else {
              controller.notice.push(controller.notice.ERROR, 'Well this is embarrassing. ' +
                'We couldn\'t join you to the project. Sorry about that.');
            }
          });
      } else {
        controller.newProject.projectName = controller.project.sendReceive.project.name;
        controller.newProject.projectCode = controller.project.sendReceive.project.identifier;
        controller.projectService.projectCodeExists(controller.newProject.projectCode).then(result => {
          if (result.ok && result.data) {
            controller.newProject.projectCode += '_lf';
          }

          controller.createProject().then(controller.getProject);
          controller.neutral();
        });
      }
    },
    goPreviousState(controller: LexiconNewProjectController): void {
      controller.$state.go(LexiconNewProjectChooserState.name);
    }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectInitialDataState = {
  name: 'newProject.initialData',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-initial-data.html',
  data: {
    step: 2,
    isSRProject: false,
    show: {
      backButton: false,
      nextButton: true,
      step3: true
    },
    nextButtonLabel: 'Skip',
    progressIndicatorStep1Label: 'Name',
    progressIndicatorStep2Label: 'Initial Data',
    progressIndicatorStep3Label: 'Verify',
    isFormValid(controller: LexiconNewProjectController): angular.IPromise<boolean> {
      return controller.neutral();
    },
    goNextState(controller: LexiconNewProjectController): void {
      if (controller.newProject.emptyProjectDesired) {
        controller.$state.go(LexiconNewProjectSelectPrimaryLanguageState.name);
        controller.neutral();
      } else {
        controller.$state.go(LexiconNewProjectVerifyDataState.name);
        controller.ok();
      }
    },
    goPreviousState(): void { }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSendReceiveCloneState = {
  name: 'newProject.sendReceiveClone',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-clone.html',
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
    goPreviousState(): void { }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectVerifyDataState = {
  name: 'newProject.verifyData',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-verify-data.html',
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
    goPreviousState(): void { }
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSelectPrimaryLanguageState = {
  name: 'newProject.selectPrimaryLanguage',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-select-primary-language.html',
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
      controller.$state.go(LexiconNewProjectInitialDataState.name);
    }
  }
} as LexiconNewProjectState;
