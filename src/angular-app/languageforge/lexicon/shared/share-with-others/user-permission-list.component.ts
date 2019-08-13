import * as angular from 'angular';
import { ProjectService } from '../../../../bellows/core/api/project.service';
import { SessionService } from '../../../../bellows/core/session.service';
import { UtilityService } from '../../../../bellows/core/utility.service';
import { Project } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { Permission } from './permissions-dropdown.component';
import { SpecialPermissionTargets } from './user-management-app.component';

export class UserPermissionListController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  allMembers: any;
  visibleMembers: any;
  userFilter = '';
  projectUrl = 'http://languageforge.org/app/lexicon/real_project_url';
  sessionData: any;
  project: Partial<Project>;
  specialPermissionTargets: SpecialPermissionTargets;
  emailInviteUser: object = {};

  static $inject = ['$q', 'projectService', 'sessionService'];
  constructor(
    private readonly $q: angular.IQService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService) { }

  $onInit(): void {

  }

  $onChanges(changes: any): void {
    console.log('changes', changes);
  }

}

export const UserPermissionListComponent: angular.IComponentOptions = {
  bindings: {
    specialPermissionTargets: '<'
  },
  controller: UserPermissionListController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/user-permission-list.component.html'
};
