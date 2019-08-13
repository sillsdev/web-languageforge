import * as angular from 'angular';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { SessionService } from '../../../../bellows/core/session.service';
import { UtilityService } from '../../../../bellows/core/utility.service';
import { Project } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { Permission } from './permissions-dropdown.component';

export interface SpecialPermissionTargets {
  anonymousUser: {role: string};
  reusableInviteLinkUser: {role: string};
}

export class UserManagementAppController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  allMembers: User[];
  visibleMembers: User[];
  userFilter: string = '';
  projectUrl = 'http://languageforge.org/app/lexicon/real_project_url';
  sessionData: any;
  project: Partial<Project>;
  specialPermissionTargets: SpecialPermissionTargets;
  emailInviteUser: Partial<User> = {};

  static $inject = ['$q', 'projectService', 'sessionService'];
  constructor(
    private readonly $q: angular.IQService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService) { }

  $onInit(): void {
    this.sessionService.getSession().then(session => {
       this.sessionData = session.data;
    });
    this.queryUserList().then(() => {
      this.visibleMembers = this.allMembers;

      // TODO: actually hook anonymousUserRole up to the backend
      this.project.anonymousUserRole = 'disabled';
      this.specialPermissionTargets = {
        anonymousUser: {role: this.project.anonymousUserRole},
        reusableInviteLinkUser: {role: this.project.reusableInviteLinkRole}
      };
    });
  }

  setEmailInviteUserAttr(attr: string, value: string) {
    this.emailInviteUser[attr] = value;
  }

  userisCurrentUser(user: User) {
    return this.sessionData.username === user.username;
  }

  userIsOwner(user: User) {
    return user.id === this.project.ownerRef.id;
  }

  onPermissionChanged($event: {permission: Permission, target: any}) {
    $event.target.role = $event.permission.name;
  }

  queryUserList(): angular.IPromise<any> {
    return this.$q(resolve => {
      this.projectService.listUsers( result => {
        if (result.ok) {
          // TODO: when turning this app into the full-fledged user-management app, the other DTO data is in result.data
          this.allMembers = result.data.users.concat(result.data.invitees.map((invitee: any) => {
            invitee.isInvitee = true;
            return invitee;
          }));
          this.project = result.data.project;
          // set the avatar_url for convenient use in the template
          for (let i = 0; i < this.allMembers.length; i++) {
            this.allMembers[i].avatar_ref = this.allMembers[i].avatar_ref || 'anonymoose.png';
            this.allMembers[i].avatarUrl = this.getAvatarUrl(this.allMembers[i].avatar_ref);
          }
          resolve();
        }
      });
    });
  }

  removeUser(user: User) {
    const index = this.visibleMembers.indexOf(user);
    this.visibleMembers.splice(index, 1);
    // TODO: actually remove the user from the project
  }

  onDeleteTarget($event: { target: any }) {
    if (($event.target as User).avatar_ref !== undefined) { // target is a User
      this.removeUser($event.target);
    }
  }

}

export const UserManagementAppComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: UserManagementAppController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/user-management-app.component.html'
};
