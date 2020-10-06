import * as angular from 'angular';
import * as ngTable from 'ng-table';
import {ProjectService} from '../../core/api/project.service';
import {SendReceiveProject} from '../../../languageforge/lexicon/shared/model/lexicon-project.model';
import { NgTableParams } from 'ng-table';
import {RolesService} from '../../core/api/roles.service';

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
  tableParams: NgTableParams<LdapiProjectInfo>;
  selectedProject: LdapiProjectInfo;
  membership: [string, string][] = [];
  roles: string[];
  selectedRole: {[username: string]: string};
  pristineRoles: {[username: string]: string};
  inProgress: {[username: string]: boolean} = {};

  static $inject = [
    'projectService',
    'rolesService',
  ];

  constructor(
    private readonly projectService: ProjectService,
    private readonly rolesService: RolesService) {
      this.rolesService.roles.then(roles => {
        this.roles = roles.map(([roleId, roleName]) => roleName);
      });
  }

  $onInit() {
    this.projectService.getAllLdapiProjects().then(result => {
      if (result.ok) {
        this.loadedProjects = result.data;
        console.log("Loaded projects", this.loadedProjects);
        this.tableParams = new NgTableParams({}, {dataset: this.loadedProjects});
      }
    });
  }

  select(project: LdapiProjectInfo) {
    this.selectedProject = project;
    var members: [string, string][] = [];
    angular.forEach(this.selectedProject.membership, (role, username) => {
      members.push([username, role]);
      console.log("Pushing", username);
      this.inProgress[username] = false;
    });
    this.membership = members;
    this.selectedRole = {};
    angular.forEach(members, ([username, role]) => this.selectedRole[username] = role);
    this.pristineRoles = {...this.selectedRole};
    console.log(this.selectedRole);
  }

  areEqual(obj1:any, obj2:any) {
    // The === operator does reference equality, and we need value equality here
    return angular.equals(obj1, obj2);
  }

  saveMembership() {
    console.log('Would save', this.selectedRole);
    // promise.then(() => {this.pristineRoles = roles;})
  }

  changeRole(member: string, oldRole: string, newRole: string) {
    if (oldRole !== newRole) {
      console.log('Would change:', member, 'to have', newRole, 'in', this.selectedProject.code);
      this.inProgress[member] = true;
      console.log()
      this.projectService.updateLdapiUserRole(this.selectedProject.code, member, newRole).then(() => this.inProgress[member] = false);
    }
  }
}

export const LdapiProjectsComponent: angular.IComponentOptions = {
  bindings: {
    something: '<',
  },
  controller: LdapiProjectsController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/ldapi-projects-view.html' // '/angular-app/languageforge/core/ldapi-projects/ldapi-projects-view.html'
};
