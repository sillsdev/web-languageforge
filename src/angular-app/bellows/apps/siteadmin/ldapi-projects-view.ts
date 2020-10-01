import * as angular from 'angular';
import * as uiGrid from 'ui-grid';
import {ProjectService} from '../../core/api/project.service';
import {SendReceiveProject} from '../../../languageforge/lexicon/shared/model/lexicon-project.model';

export interface LdapiMembershipInfo {
  [username: string]: string;
}

export interface LdapiProjectInfo {
  code: string;
  description: string;
  name: string;
  membership: LdapiMembershipInfo;
}

export class LdapiProjectsController implements angular.IController {
  projects = [{name: 'foo', identifier: 'foo'}, {name: 'bar', identifier: 'bar'}];
  loadedProjects: LdapiProjectInfo[];

  static $inject = [
    'projectService',
  ];

  constructor(private readonly projectService: ProjectService) {
  }

  $onInit() {
    this.projectService.getAllLdapiProjects().then(result => {
      if (result.ok) {
        this.loadedProjects = result.data;
        console.log("Loaded projects", this.loadedProjects);
      }
    });
  }
}

export const LdapiProjectsComponent: angular.IComponentOptions = {
  bindings: {
    something: '<',
  },
  controller: LdapiProjectsController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/ldapi-projects-view.html' // '/angular-app/languageforge/core/ldapi-projects/ldapi-projects-view.html'
};
