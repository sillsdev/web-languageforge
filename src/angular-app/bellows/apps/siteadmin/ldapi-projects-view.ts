import * as angular from 'angular';
import {ProjectService} from '../../core/api/project.service';
import { NgTableParams } from 'ng-table';
import { LdapiProjectDto, LdapiProjectInfo } from '../../../bellows/shared/model/ldapi.model';

export class LdapiProjectsController implements angular.IController {
  loadedProjects: LdapiProjectInfo[];  // TODO: Rename to just "projects"
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
    this.projectService.getLdapiProjectDto(project.projectCode).then(result => {
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
  templateUrl: '/angular-app/bellows/apps/siteadmin/ldapi-projects-view.html'
};
