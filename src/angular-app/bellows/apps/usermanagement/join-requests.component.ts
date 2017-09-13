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
    this.projectService.acceptJoinRequest(userId, role, (result) => {
      if (result.ok) {
        this.projectService.getJoinRequests((result) => {
          this.joinRequests = result.data;
         });
      }
    })
  };

  denyJoinRequest(userId: string) {
    this.projectService.denyJoinRequest(userId, (result) => {
      if (result.ok) {
        this.projectService.getJoinRequests((result) => {
          this.joinRequests = result.data;
         });
      }
    })
  };

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
