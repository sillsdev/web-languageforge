import * as angular from 'angular';

import { InviteMemberFormComponent } from './invite-member-form.component';
import { PermissionsDropdownComponent } from './permissions-dropdown.component';
import { ShareWithOthersComponent } from './share-with-others.component';
import { UserManagementAppComponent } from './user-management-app.component';
import { UserPermissionListComponent } from './user-permission-list.component';

export const ShareWithOthersModule = angular
  .module('shareWithOthersModule', [
    'ui.bootstrap'
  ])
  .component('shareWithOthersModal', ShareWithOthersComponent)
  .component('userManagementApp', UserManagementAppComponent)
  .component('permissionsDropdown', PermissionsDropdownComponent)
  .component('inviteMemberForm', InviteMemberFormComponent)
  .component('userPermissionList', UserPermissionListComponent)
  .name;
