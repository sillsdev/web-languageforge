import * as angular from 'angular';
import * as ngTable from 'ng-table';
import {ProjectService} from '../../core/api/project.service';
import { NgTableParams } from 'ng-table';
import {LdapiProjectDto} from '../../../languageforge/ldproject/ldproject-app.component';

// TODO: move this and LdapiProjectInfo to an ldapi-models.ts file
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
  loadedProjects: LdapiProjectInfo[];  // TODO: Replace with LdapiProjectDto if possible. TODO: Rename to just "projects"
  tableParams: NgTableParams<LdapiProjectInfo>;
  selectedProject: LdapiProjectDto;

  static $inject = [
    'projectService',
  ];

  constructor(private readonly projectService: ProjectService) { }

  $onInit() {
    this.projectService.getAllLdapiProjects().then(result => {
      if (result.ok) {
        this.loadedProjects = result.data;
        this.tableParams = new NgTableParams({}, {dataset: this.loadedProjects});
      }
    });
  }

  select(project: LdapiProjectInfo) {
    this.projectService.getLdapiProjectDto(project.code).then(result => {
      if (result.ok) {
        this.selectedProject = result.data;
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
