import * as angular from 'angular';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { UserService } from '../../../../bellows/core/api/user.service';
import { Session } from '../../../../bellows/core/session.service';
import { UtilityService } from '../../../../bellows/core/utility.service';
import { Project } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { LexRoleKey } from '../model/lexicon-project.model';
import { Permission } from './permissions-dropdown.component';

export interface PermissionTarget {
  name: string;
  role: string;
}

export class UserManagementController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  allMembers: User[];
  visibleMembers: Array<Partial<User>>;
  userFilter: string = '';
  projectUrl = 'http://languageforge.org/app/lexicon/real_project_url';
  project: Project;
  session: Session;
  anonymousUser: PermissionTarget;
  reusableInviteLinkUser: PermissionTarget;

  static $inject = ['$q', 'projectService', 'userService'];
  constructor(
    private readonly $q: angular.IQService,
    private readonly projectService: ProjectService,
    private readonly userService: UserService) { }

  $onInit(): void {
    // TODO: actually hook anonymousUserRole up to the backend
    // TODO: actually hook reusableInviteLinkRole up to the backend
    this.project.anonymousUserRole = 'disabled';
    this.project.reusableInviteLinkRole = 'disabled';
    this.anonymousUser = { name: 'annonymousUser', role: this.project.anonymousUserRole };
    this.reusableInviteLinkUser = { name: 'reusableInviteLinkUser', role: this.project.reusableInviteLinkRole };
  }

  userisCurrentUser(user: User) {
    return this.session.data.username === user.username;
  }

  userIsOwner(user: User) {
    return user.id === this.project.ownerRef.id;
  }

  onUserPermissionChanged($event: {permission: Permission, target: Partial<User>}) {
    $event.target.role = $event.permission.name;
    this.projectService.updateUserRole($event.target.id, $event.permission.name);
  }

  onSpecialPermissionChanged($event: {permission: Permission, target: PermissionTarget}) {
    $event.target.role = $event.permission.name;
    console.log('TODO: actually set ' + $event.target.name + ' permissions to ' + $event.target.role);
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

  onSendEmailInvite($event: { email: string, role: LexRoleKey }) {
    this.userService.sendInvite($event.email, $event.role).then(() => {
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
