import * as angular from 'angular';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { Project, ProjectRole } from '../../../../bellows/shared/model/project.model';
import { LexRoles } from '../model/lexicon-project.model';
import { RoleDetail } from './role-dropdown.component';

export class InviteMemberFormController implements angular.IController {
  project: Project;
  reusableInviteLinkRoles: ProjectRole[];
  reusableInviteLinkRole: ProjectRole;
  inviteLink: string;
  emailInviteRoles: ProjectRole[];
  emailInviteRole: ProjectRole;
  onSendEmailInvite: (params: { $event: { email: string, role: string } }) => void;

  static $inject = ['projectService'];
  constructor(private readonly projectService: ProjectService) { }

  $onInit(): void {

    this.emailInviteRole = LexRoles.CONTRIBUTOR;

    if (this.project.inviteToken.token) {
      this.projectService.getInviteLink().then(result => {
        this.inviteLink = result.data;
      });
    }

    this.emailInviteRoles = [
      LexRoles.MANAGER,
      LexRoles.CONTRIBUTOR,
      LexRoles.OBSERVER_WITH_COMMENT,
      LexRoles.OBSERVER
    ];

    this.reusableInviteLinkRoles = [
      LexRoles.MANAGER,
      LexRoles.CONTRIBUTOR,
      LexRoles.OBSERVER_WITH_COMMENT,
      LexRoles.OBSERVER,
      LexRoles.NONE
    ];
  }

  onRoleChanged($event: {roleDetail: RoleDetail, target: any}) {
    if ($event.target === 'email_invite') this.emailInviteRole = $event.roleDetail.role;
    if ($event.target === 'reusable_invite_link') this.handleInviteLinkChange($event.roleDetail.role);
  }

  handleInviteLinkChange(newRole: ProjectRole) {
    if (newRole.key === LexRoles.NONE.key) {
      this.projectService.disableInviteToken().then(() => {
        this.project.inviteToken.defaultRole = newRole.key;
        this.inviteLink = '';
      });
    } else {
      // if the invite link was just disabled, create a new one. Otherwise, update it.
      if (!this.inviteLink) {
        this.projectService.createInviteLink(newRole.key).then(result => {
          this.project.inviteToken.defaultRole = newRole.key;
          this.inviteLink = result.data;
        });
      } else {
        this.projectService.updateInviteTokenRole(newRole.key).then(() => {
          this.project.inviteToken.defaultRole = newRole.key;
        });
      }
    }
  }

}

export const InviteMemberFormComponent: angular.IComponentOptions = {
  bindings: {
    project: '<',
    onSendEmailInvite: '&'
  },
  controller: InviteMemberFormController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/invite-member-form.component.html'
};
