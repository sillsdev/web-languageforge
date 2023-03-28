import * as angular from 'angular';

import {LexiconSendReceiveApiService} from '../../core/lexicon-send-receive-api.service';
import {LexiconProject, SendReceiveProject} from '../../shared/model/lexicon-project.model';
import {LexiconNewProjectState} from '../lexicon-new-project-state.model';
import {LexiconNewProjectController} from '../lexicon-new-project.component';
import {NewProjectAbstractState} from '../lexicon-new-project.component';

export class NewProjectSendReceiveCredentialsController implements angular.IController {
  srcProject: LexiconProject;
  srcValidate: () => void;
  srcReset: () => void;

  projectsIndex: number;
  showPassword: boolean;

  static $inject = ['lexSendReceiveApi'];
  constructor(private sendReceiveApi: LexiconSendReceiveApiService) { }

  $onInit(): void {
    this.checkSRProject();
  }

  checkSRProject() {
    this.srcProject.sendReceive.credentialsStatus = 'loading';
    this.sendReceiveApi.getUserProjects(this.srcProject.sendReceive.username, this.srcProject.sendReceive.password)
      .then(result => {
        this.srcProject.sendReceive.isUnchecked = false;
        this.srcProject.sendReceive.projects = result.data.projects;
        if (result.ok) {
          if (result.data.hasValidCredentials) {
            this.srcProject.sendReceive.credentialsStatus = 'valid';
          } else {
            this.srcProject.sendReceive.credentialsStatus = 'invalid';
          }
        } else {
          this.srcProject.sendReceive.credentialsStatus = 'failed';
        }
      }
    );
  }

  // noinspection JSMethodCanBeStatic
  projectOption(project: SendReceiveProject) {
    if (!project) {
      return '';
    }

    let option = project.name + ' (' + project.identifier;
    if (project.repoClarification) {
      option += ', ' + project.repoClarification;
    }
    if (project.role !== 'unknown') {
      option += ', ' + project.role;
    }
    option += ')';
    return option;
  }

  showProjectSelect() {
    const show = this.srcProject.sendReceive.credentialsStatus === 'valid';
    if (show && this.srcProject.sendReceive.project != null && this.srcProject.sendReceive.project.identifier != null &&
      this.srcProject.sendReceive.projects != null
    ) {
      for (let index = 0; index < this.srcProject.sendReceive.projects.length; index++) {
        const project = this.srcProject.sendReceive.projects[index];
        if (project.identifier === this.srcProject.sendReceive.project.identifier &&
          project.repository === this.srcProject.sendReceive.project.repository
        ) {
          this.projectsIndex = index;
        }
      }
    }

    return show;
  }

}

export const NewProjectSendReceiveCredentialsComponent: angular.IComponentOptions = {
  bindings: {
    srcProject: '=',
    srcValidate: '&',
    srcReset: '&'
  },
  controller: NewProjectSendReceiveCredentialsController,
  templateUrl:
    '/angular-app/languageforge/lexicon/new-project/send-receive/new-project-credentials.component.html'
};

export const NewProjectSendReceiveCredentialsState = {
  name: 'newProject.sendReceiveCredentials',
  template: `
    <new-project-send-receive-credentials src-project="$ctrl.project" src-validate="$ctrl.validateForm()"
                              src-reset="$ctrl.resetValidateProjectForm()">
    </new-project-send-receive-credentials>
  `,
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
      controller.$state.go(NewProjectAbstractState.name);
    }
  }
} as LexiconNewProjectState;
