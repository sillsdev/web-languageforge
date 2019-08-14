import * as angular from 'angular';
import { LexRoleKey } from './user-management.component';

/*
* The options in the dropdown can be changed by using the `permissions=` attribute in HTML.
* setting `allow-disable="true"` will add a disable option to the dropdown
* setting `allow-delete="true"` will add a delete option to the dropdown with a corresponding `on-delete-target` call
*/

export interface Permission {
  name: string;
  description: string;
  icon: string;
}

export class PermissionsDropdownController implements angular.IController {
  target: any;
  permissions: Permission[];
  selectedPermission: Permission;
  initial: LexRoleKey | 'disabled';
  allowDisable: boolean;
  allowDelete: boolean;
  onPermissionChanged: (params: { $event: { permission: Permission, target: any } }) => void;
  onDeleteTarget: (params: { $event: { target: any } }) => void;

  constructor() { }

  $onInit(): void {
    this.permissions = this.permissions || [
      {name: 'contributor', description: 'can edit', icon: 'pencil'},
      {name: 'observer_with_comment', description: 'can comment', icon: 'comment'},
      {name: 'observer', description: 'can view', icon: 'eye'}
    ];
    if (this.allowDisable) {
      this.permissions.push({name: 'disabled', description: 'turn off', icon: 'ban'});
    }

    this.selectedPermission = this.permissions.find(permission => permission.name === this.initial)
      || this.permissions[this.permissions.length - 1];
  }

  selectPermission(permission: Permission) {
    if (this.selectedPermission.name !== permission.name) {
      this.selectedPermission = permission;
      this.onPermissionChanged({ $event: { permission, target: this.target } });
    }
  }

}

export const PermissionsDropdownComponent: angular.IComponentOptions = {
  bindings: {
    target: '<',
    initial: '<',
    onPermissionChanged: '&',
    onDeleteTarget: '&',
    allowDisable: '<',
    allowDelete: '<'
  },
  controller: PermissionsDropdownController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/permissions-dropdown.component.html'
};
