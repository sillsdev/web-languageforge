import * as angular from 'angular';
import * as ngTable from 'ng-table';
import {ProjectService} from '../../core/api/project.service';
import {UserService} from '../../core/api/user.service';
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
  filterUsers: string;
  users: any;

  static $inject = [
    'projectService',
    'userService',
    'rolesService',
  ];

  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
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
      this.inProgress[member] = true;
      this.projectService.updateLdapiUserRole(this.selectedProject.code, member, newRole).then(() => this.inProgress[member] = false);
    }
  }

  deleteFromProject(member: string) {
    this.inProgress[member] = true;
    this.projectService.removeUserFromLdapiProject(this.selectedProject.code, member).then(() => {
      this.inProgress[member] = false;
      // Remove user from UI by creating a *new* membership list (Angular defaults to tracking arrays by reference)
      this.membership = this.membership.filter(([username, role]) => username !== member);
    });
  }

  addToProject(member: string) {
    // Adds user as a contributor; if other role is desired, admin can update it with dropdown after adding
    const contributor = this.rolesService.contributor;
    this.projectService.updateLdapiUserRole(this.selectedProject.code, member, contributor).then(() => {
      // Add user to UI by creating a *new* membership list (Angular defaults to tracking arrays by reference)
      this.selectedRole[member] = contributor;
      const newMember: [string,string] = [member, contributor];
      this.membership = [...this.membership, newMember];
    });
  }

  queryUsers(): void {
    this.userService.getAllLdapiUsers().then(result => {
      if (result.ok) {
        this.users = result.data;
      } else {
        this.users = [];
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
