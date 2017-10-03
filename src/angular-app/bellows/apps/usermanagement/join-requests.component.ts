import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { Rights } from './user-management-app.component';

export class UserManagementJoinRequestsController implements angular.IController {
  joinRequests: any;
  roles: any;
  rights: Rights;

  static $inject = ['userService', 'projectService'];
  constructor(private userService: UserService, private projectService: ProjectService) {}

  acceptJoinRequest(userId: string, role: string) {
    this.projectService.acceptJoinRequest(userId, role, acceptResult => {
      if (acceptResult.ok) {
        this.projectService.getJoinRequests(getResult => {
          this.joinRequests = getResult.data;
         });
      }
    });
  }

  denyJoinRequest(userId: string) {
    this.projectService.denyJoinRequest(userId, denyResult => {
      if (denyResult.ok) {
        this.projectService.getJoinRequests(getResult => {
          this.joinRequests = getResult.data;
         });
      }
    });
  }

}

export const UserManagementJoinRequestsComponent: angular.IComponentOptions = {
  bindings: {
    joinRequests: '<',
    roles: '<',
    rights: '<'
  },
  controller: UserManagementJoinRequestsController,
  templateUrl: '/angular-app/bellows/apps/usermanagement/join-requests.component.html'
};
