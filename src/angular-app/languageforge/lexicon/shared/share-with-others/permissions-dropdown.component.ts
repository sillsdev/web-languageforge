import * as angular from 'angular';
import { CommentsOfflineCacheService } from '../../../../bellows/core/offline/comments-offline-cache.service';

export class PermissionsDropdownController implements angular.IController {
  permissions: any[];
  selectedPermission: object;

  static $inject = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    this.permissions = [
      {name: 'edit', description: 'can edit', icon: 'pencil'},
      {name: 'comment', description: 'can comment', icon: 'comment'},
      {name: 'view', description: 'can view', icon: 'eye'}
    ];

    this.setSelectedPermission(this.permissions[this.permissions.length-1]);
  }

  setSelectedPermission(permission: object) {
    this.selectedPermission = permission;
  }

}

export const PermissionsDropdownComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: PermissionsDropdownController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/permissions-dropdown.component.html'
};
