import * as angular from 'angular';
import * as uiGrid from 'ui-grid';
import {UserService} from '../../core/api/user.service';

// export interface LdapiUserInfo {
//   code: string;
//   description: string;
//   name: string;
//   membership: LdapiMembershipInfo;
// }

export class LdapiUsersController implements angular.IController {
  Users = [{name: 'foo', identifier: 'foo'}, {name: 'bar', identifier: 'bar'}];
  loadedUsers: any[];

  static $inject = [
    'userService',
  ];

  constructor(private readonly userService: UserService) {
  }

  $onInit() {
    this.userService.getAllLdapiUsers().then(result => {
      if (result.ok) {
        this.loadedUsers = result.data;
        console.log("Loaded users", this.loadedUsers);
      }
    });
  }
}

export const LdapiUsersComponent: angular.IComponentOptions = {
  bindings: {
    something: '<',
  },
  controller: LdapiUsersController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/ldapi-users-view.html'
};
