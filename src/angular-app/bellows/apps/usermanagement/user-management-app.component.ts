import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { SessionService } from '../../core/session.service';

export class Rights {
  remove: boolean;
  add: boolean;
  changeRole: boolean;
  showControlBar: boolean;
}

export class UserManagementAppController implements angular.IController {
  rights = new Rights();
  roles = {};
  project = {
    roles: {}
  };
  list = {
    visibleUsers: {},
    users: {},
    userCount: 0
  };
  joinRequests = {};

  static $inject = ['$location', 'projectService', 'sessionService'];
  constructor(private $location: angular.ILocationService, private projectService: ProjectService,
              private sessionService: SessionService) { }

  $onInit(): void {
    this.joinRequests = [];
    this.projectService.getJoinRequests(result => {
      this.joinRequests = result.data;
    });

    // load roles if they have not been loaded yet
    if (Object.keys(this.roles).length === 0) {
      this.queryUserList();
    }

    this.sessionService.getSession().then(session => {
      this.rights.remove = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.DELETE);
      this.rights.add = session.hasProjectRight(this.sessionService.domain.USERS, this.sessionService.operation.CREATE);
      this.rights.changeRole = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.EDIT);
      this.rights.showControlBar =
        this.rights.add || this.rights.remove || this.rights.changeRole;
    });
  }

  // noinspection JSUnusedGlobalSymbols
  isActive(route: string) {
    return route === this.$location.path();
  }

  queryUserList() {
    this.projectService.listUsers(result => {
      if (result.ok) {
        this.list.users = result.data.users;
        this.list.userCount = result.data.userCount;
        this.project = result.data.project;
        this.roles = this.project.roles;
      }
    });
  }

}

export const UserManagementAppComponent: angular.IComponentOptions = {
  controller: UserManagementAppController,
  templateUrl: '/angular-app/bellows/apps/usermanagement/user-management-app.component.html'
};
