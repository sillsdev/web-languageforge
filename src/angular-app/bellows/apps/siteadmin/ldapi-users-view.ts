import * as angular from 'angular';
import {UserService} from '../../core/api/user.service';
import { NgTableParams } from 'ng-table';

export interface LdapiUserInfo {
  username: string;
  email?: string;
  firstname: string;
  lastname: string;
  language?: string;
}

export class LdapiUsersController implements angular.IController {
  Users = [{name: 'foo', identifier: 'foo'}, {name: 'bar', identifier: 'bar'}];
  loadedUsers: any[];
  tableParams: NgTableParams<LdapiUserInfo>;

  static $inject = [
    'userService',
  ];

  constructor(private readonly userService: UserService) {
  }

  $onInit() {
    this.userService.getAllLdapiUsers().then(result => {
      if (result.ok) {
        this.loadedUsers = result.data;
        this.tableParams = new NgTableParams({}, {dataset: this.loadedUsers});
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
