import * as angular from 'angular';
import { ProjectRole } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { LexRoles } from '../model/lexicon-project.model';

/*
* The options in the dropdown can be changed by using the `roles=` attribute in HTML.
* setting `allow-delete="true"` will add a delete option to the dropdown with a corresponding `on-delete-target` call
*/

export interface RoleDetail {
  role: ProjectRole;
  description: string;
  icon: string;
}

export class RoleDropdownController implements angular.IController {
  target: Partial<User> | string;
  roles: ProjectRole[];
  roleDetails: RoleDetail[];
  selectedRoleDetail: RoleDetail;
  selectedRole: ProjectRole;
  allowDisable: boolean;
  allowDelete: boolean;
  onRoleChanged: (params: { $event: { roleDetail: RoleDetail, target: any } }) => void;
  onDeleteTarget: (params: { $event: { target: any } }) => void;

  static $inject = ['$scope'];
  constructor(private readonly $scope: angular.IScope) { }

  $onInit(): void {
    if (!this.roleDetails) this.buildRoleDetails();
    this.selectedRole = this.selectedRole || this.roles[this.roles.length - 1];
  }

  $onChanges(changes: any): void {
    if (changes.selectedRole) {
      if (!this.roleDetails) this.buildRoleDetails();
      this.selectedRoleDetail = this.roleDetails.find(p => p.role.key === (this.selectedRole.key || this.selectedRole));
    }
  }

  buildRoleDetails(): void {
    this.roleDetails = [];
    this.roles.forEach(role => {
      switch (role) {
        case LexRoles.MANAGER:
          this.roleDetails.push({
            role,
            description: 'can manage',
            icon: 'vcard'
          });
          break;
        case LexRoles.CONTRIBUTOR:
          this.roleDetails.push({
            role,
            description: 'can edit',
            icon: 'pencil'
          });
          break;
        case LexRoles.OBSERVER_WITH_COMMENT:
            this.roleDetails.push({
              role,
              description: 'can comment',
              icon: 'comment'
            });
            break;
        case LexRoles.OBSERVER:
            this.roleDetails.push({
              role,
              description: 'can view',
              icon: 'eye'
            });
            break;
        case LexRoles.NONE:
            this.roleDetails.push({
              role,
              description: 'disable',
              icon: 'ban'
            });
            break;
      }
    });
  }

  selectRoleDetail(roleDetail: RoleDetail): void {
    if (this.selectedRoleDetail.role.key !== roleDetail.role.key) {
      this.selectedRoleDetail = roleDetail;
      this.onRoleChanged({ $event: { roleDetail, target: this.target } });
    }
  }

}

export const RoleDropdownComponent: angular.IComponentOptions = {
  bindings: {
    target: '<',
    roles: '<',
    selectedRole: '<',
    onRoleChanged: '&',
    onDeleteTarget: '&',
    allowDelete: '<'
  },
  controller: RoleDropdownController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/role-dropdown.component.html'
};
