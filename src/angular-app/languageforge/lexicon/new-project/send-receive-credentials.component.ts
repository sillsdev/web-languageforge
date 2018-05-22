import * as angular from 'angular';

import {LexiconSendReceiveApiService} from '../core/lexicon-send-receive-api.service';
import {LexiconProject, SendReceiveProject} from '../shared/model/lexicon-project.model';

export class SendReceiveCredentialsController implements angular.IController {
  srcProject: LexiconProject;
  srcValidate: () => void;
  srcReset: () => void;

  projectsIndex: number;
  showPassword: boolean;

  static $inject = ['lexSendReceiveApi'];
  constructor(private sendReceiveApi: LexiconSendReceiveApiService) {
  }

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

export const SendReceiveCredentialsComponent: angular.IComponentOptions = {
  bindings: {
    srcProject: '=',
    srcValidate: '&',
    srcReset: '&'
  },
  controller: SendReceiveCredentialsController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/send-receive-credentials.component.html'
};
