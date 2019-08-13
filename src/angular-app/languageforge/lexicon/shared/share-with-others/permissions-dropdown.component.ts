import * as angular from 'angular';

/*
* The options in the dropdown can be changed by using the `permissions=` attribute in HTML.
* setting `allow-disable="true"` will add a disable option to the dropdown
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
  selected: string;
  allowDisable: boolean;
  onPermissionChanged: (params: {$event: {permission: Permission, target: any}}) => void;

  static $inject = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    this.permissions = this.permissions || [
      {name: 'contributor', description: 'can edit', icon: 'pencil'},
      {name: 'observer_with_comment', description: 'can comment', icon: 'comment'},
      {name: 'observer', description: 'can view', icon: 'eye'}
    ];
    if (this.allowDisable) {
      this.permissions.push({name: 'disabled', description: 'turn off', icon: 'ban'});
    }

    this.selectedPermission = this.permissions.find(permission => permission.name === this.selected)
      || this.permissions[this.permissions.length-1];
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
    selected: '<',
    onPermissionChanged: '&',
    onDeleteTarget: '&',
    allowDisable: '<',
  },
  controller: PermissionsDropdownController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/permissions-dropdown.component.html'
};
