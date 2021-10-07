import * as angular from 'angular';
import { JsonRpcResult } from 'src/angular-app/bellows/core/api/api.service';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { UserService } from '../../../../bellows/core/api/user.service';
import { Session, SessionService } from '../../../../bellows/core/session.service';
import { Project, ProjectRole } from '../../../../bellows/shared/model/project.model';
import { LexRoles } from '../model/lexicon-project.model';
import { RoleDetail } from './role-dropdown.component';

export class InviteMemberFormController implements angular.IController {
  project: Project;
  session: Session;
  currentUserIsManager: boolean;
  reusableInviteLinkRoles: ProjectRole[];
  reusableInviteLinkRole: ProjectRole;
  inviteLink: string;
  inviteEmail: string;
  emailInviteRoles: ProjectRole[];
  emailInviteRole: ProjectRole;
  displayManagerElements: boolean;
  onSendEmailInvite: () => void;

  static $inject = ['projectService', 'sessionService', 'userService'];
  constructor(private readonly projectService: ProjectService,
              private readonly sessionService: SessionService,
              private readonly userService: UserService) {

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

    this.sessionService.getSession().then((session: Session) => {
      this.session = session;
      this.project = session.data.project;
      this.currentUserIsManager =
        this.session.data.userProjectRole === LexRoles.MANAGER.key ||
        this.session.data.userProjectRole === LexRoles.TECH_SUPPORT.key;

      if (this.currentUserIsManager) {
        this.emailInviteRole = LexRoles.CONTRIBUTOR;
      } else {
        this.emailInviteRole = this.emailInviteRoles.find(role => role.key === this.session.data.userProjectRole);
      }

      if (this.project.inviteToken.token) {
        this.projectService.getInviteLink().then((result: any) => {
          this.inviteLink = result.data;
        });
      }
    });
  }

  $postLink(): void {
    angular.element('input[type=email]')[0].focus();
  }

  sendEmailInvite() {
    this.userService.sendInvite(this.inviteEmail, this.emailInviteRole.key).then(() => {
      this.onSendEmailInvite();
      this.inviteEmail = '';
    });
  }

  inviteEmailDisabled() {
    return !/^\S+@\S+\.\S+$/.test(this.inviteEmail);
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
        this.projectService.createInviteLink(newRole.key).then((result: any) => {
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

  getInviteRole() {
    return this.reusableInviteLinkRoles.find(role => role.key === this.project.inviteToken.defaultRole);
  }

}

export const InviteMemberFormComponent: angular.IComponentOptions = {
  bindings: {
    onSendEmailInvite: '&'
  },
  controller: InviteMemberFormController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/invite-member-form.component.html'
};
