import * as angular from 'angular';

import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController, NewProject} from '../lexicon-new-project.component';
import { NewProjectSendReceiveCredentialsState } from '../send-receive/new-project-credentials.component';
import {NewProjectInitialDataState} from './new-project-initial-data.component';

export class NewProjectNameController implements angular.IController {
  npnNewProject: NewProject;
  npnProjectCodeState: string;
  npnCheckProjectCode: () => void;
  npnResetValidateProjectForm: () => void;
  npnValidateForm: () => void;

  static $inject = ['$scope'];
  constructor(private readonly $scope: angular.IScope) { }

  $onInit(): void {

    this.$scope.$watch(() => this.npnProjectCodeState, (newVal: string, oldVal: string) => {
      if (!newVal || newVal === oldVal) {
        return;
      }

      if (newVal === 'unchecked') {
        // User just typed in the project name box. Need to wait just a bit for the idle-validate to kick in.
        return;
      }

      if (oldVal === 'loading') {
        // Project code state just resolved. Validate rest of form so Forward button can activate.
        this.npnValidateForm();
      }
    });

    this.$scope.$watch(() => this.npnNewProject.editProjectCode, (newVal: boolean, oldVal: boolean) => {
      if (oldVal && !newVal) {
        // When user unchecks the "edit project code" box, go back to setting it from project name
        this.npnNewProject.projectCode = NewProjectNameController.projectNameToCode(this.npnNewProject.projectName);
        this.npnCheckProjectCode();
      }
    });

    this.$scope.$watch(() => this.npnNewProject.projectName, (newVal: string, oldVal: string) => {
      if (newVal == null) {
        this.npnNewProject.projectCode = '';
      } else if (newVal !== oldVal) {
        this.npnNewProject.projectCode = newVal.toLowerCase().replace(/ /g, '_');
      }
    });

  }

  private static projectNameToCode(name: string): string {
    if (name == null) {
      return undefined;
    }
    return name.toLowerCase().replace(/ /g, '_');
  }

}

export const NewProjectNameComponent: angular.IComponentOptions = {
  bindings: {
    npnNewProject: '=',
    npnProjectCodeState: '<',
    npnCheckProjectCode: '&',
    npnResetValidateProjectForm: '&',
    npnValidateForm: '&'
  },
  controller: NewProjectNameController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/non-send-receive/new-project-name.controller.html'
};

export const NewProjectNameState = {
  url: '/new-proj-nonsr-name',
  name: 'newProject.name',
  template: `
    <new-project-name npn-new-project="$ctrl.newProject"
      npn-project-code-state="$ctrl.projectCodeState"
      npn-check-project-code="$ctrl.checkProjectCode()"
      npn-reset-validate-project-form="$ctrl.resetValidateProjectForm()"
      npn-validate-form="$ctrl.validateForm()">
    </new-project-name>
  `,
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
      controller.$state.go(NewProjectInitialDataState.name);
      controller.projectCodeState = 'empty';
      controller.projectCodeStateDefer = controller.$q.defer();
      controller.projectCodeStateDefer.resolve('empty');
      controller.neutral();
    },
    goPreviousState(controller: LexiconNewProjectController): void {
      controller.$state.go(NewProjectSendReceiveCredentialsState.name);
    }
  }
} as LexiconNewProjectState;
