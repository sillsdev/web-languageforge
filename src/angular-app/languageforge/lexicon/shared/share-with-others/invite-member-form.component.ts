import * as angular from 'angular';
import { Permission } from './permissions-dropdown.component';
import { PermissionTarget } from './user-management.component';

export class InviteMemberFormController implements angular.IController {
  reusableInviteLinkUser: PermissionTarget;
  inviteLink: string;
  emailInviteUserRole: string;
  onSendEmailInvite: (params: { $event: { email: string, role: string } }) => void;

  constructor() { }

  $onInit(): void {
    this.emailInviteUserRole = 'contributor';
    this.inviteLink = this.generateInviteLink();
  }

  generateInviteLink(): string {
    // TODO: get this invite link from the server
    return 'http://languageforge.org/join/5XxyT47eWBdS';
  }

  onPermissionChanged($event: {permission: Permission, target: any}) {
    if ($event.target === 'email_invite_user') this.emailInviteUserRole = $event.permission.name;
  }

}

export const InviteMemberFormComponent: angular.IComponentOptions = {
  bindings: {
    reusableInviteLinkUser: '<',
    onSendEmailInvite: '&'
  },
  controller: InviteMemberFormController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/invite-member-form.component.html'
};
