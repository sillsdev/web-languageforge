import * as angular from 'angular';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { UserService } from '../../../../bellows/core/api/user.service';
import { Session } from '../../../../bellows/core/session.service';
import { UtilityService } from '../../../../bellows/core/utility.service';
import { Project, ProjectRole } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { LexRoles } from '../model/lexicon-project.model';
import { RoleDetail } from './role-dropdown.component';

export class UserManagementController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  allMembers: User[];
  visibleMembers: Array<Partial<User>>;
  userFilter: string = '';
  projectUrl = 'http://languageforge.org/app/lexicon/real_project_url';
  project: Project;
  session: Session;
  anonymousUserRoles: ProjectRole[];
  memberRoles: ProjectRole[];

  static $inject = ['$q', 'projectService', 'userService'];
  constructor(
    private readonly $q: angular.IQService,
    private readonly projectService: ProjectService,
    private readonly userService: UserService) { }

  $onInit(): void {
    // TODO: actually hook anonymousUserRole up to the backend
    // TODO: actually hook reusableInviteLinkRole up to the backend
    this.project.anonymousUserRole = LexRoles.NONE.key;
    this.project.reusableInviteLinkRole = LexRoles.NONE.key;

    this.anonymousUserRoles = [
      LexRoles.CONTRIBUTOR,
      LexRoles.OBSERVER_WITH_COMMENT,
      LexRoles.OBSERVER,
      LexRoles.NONE
    ];

    this.memberRoles = [
      LexRoles.MANAGER,
      LexRoles.CONTRIBUTOR,
      LexRoles.OBSERVER_WITH_COMMENT,
      LexRoles.OBSERVER
    ];
  }

  userisCurrentUser(user: User) {
    return this.session.data.username === user.username;
  }

  userIsOwner(user: User) {
    return user.id === this.project.ownerRef.id;
  }

  onUserRoleChanged($event: {roleDetail: RoleDetail, target: Partial<User>}) {
    this.projectService.updateUserRole($event.target.id, $event.roleDetail.role.key).then(() => {
      this.loadMemberData();
    });
  }

  onSpecialRoleChanged($event: {roleDetail: RoleDetail, target: string}) {
    if ($event.target === 'anonymous_user') {
      this.project.anonymousUserRole = $event.roleDetail.role.key;
      console.log('TODO: actually set ' + $event.target + ' role to ' + $event.roleDetail.role.key);
    }
  }

  loadMemberData(): angular.IPromise<void> {
    return this.projectService.listUsers().then( result => {
      if (result.ok) {
        // include invitees in the list of members
        this.allMembers = result.data.users.concat(result.data.invitees.map((invitee: User) => {
          invitee.isInvitee = true;
          return invitee;
        }));

        // set the avatar_url for convenient use in the template
        for (let i = 0; i < this.allMembers.length; i++) {
          this.allMembers[i].avatar_ref = this.allMembers[i].avatar_ref || 'anonymoose.png';
          this.allMembers[i].avatarUrl = this.getAvatarUrl(this.allMembers[i].avatar_ref);
        }
      }
    });
  }

  onSendEmailInvite($event: { email: string, role: ProjectRole }) {
    this.userService.sendInvite($event.email, $event.role.key).then(() => {
      this.loadMemberData();
    });
  }

  removeUser(user: User) {
    this.projectService.removeUsers([user.id]).then(() => {
      this.loadMemberData();
    });
  }

  onDeleteTarget($event: { target: any }) {
    if (($event.target as User).avatar_ref !== undefined) { // target is a User
      this.removeUser($event.target);
    }
  }

}

export const UserManagementComponent: angular.IComponentOptions = {
  bindings: {
    project: '<',
    session: '<'
  },
  controller: UserManagementController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/user-management.component.html'
};
