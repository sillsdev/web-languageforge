import * as angular from 'angular';
import { Session } from 'src/angular-app/bellows/core/session.service';
import { Project, ProjectRole } from '../../../../bellows/shared/model/project.model';
import { User } from '../../../../bellows/shared/model/user.model';
import { LexRoles } from '../model/lexicon-project.model';

/*
* The options in the dropdown can be changed by using the `roles=` attribute in HTML.
* setting `allow-delete="true"` will add a delete option to the dropdown with a corresponding `on-delete-target` call
*/

export interface RoleDetail {
  role: ProjectRole;
  description: string;
  icon: string;
}

export class RoleDropdownController implements angular.IController {
  target: Partial<User> | string;
  roles: ProjectRole[];
  roleDetails: RoleDetail[];
  selectedRoleDetail: RoleDetail;
  selectedRole: ProjectRole;
  projectUrl = 'http://languageforge.org/app/lexicon/real_project_url';
  project: Project;
  session: Session;
  allowDisable: boolean;
  userIsTechSupport: () => boolean;
  currentUserIsOwnerOrAdmin: () => boolean;
  onRoleChanged: (params: { $event: { roleDetail: RoleDetail, target: any } }) => void;
  onDeleteTarget: (params: { $event: { target: any } }) => void;
  onOwnershipTransfer: (params: { $event: { target: any } }) => void;

  static $inject = ['$scope'];
  constructor(private readonly $scope: angular.IScope) { }

  $onChanges(changes: any): void {
    if (changes.roles) this.buildRoleDetails();

    if (changes.selectedRole) {
      const selectedRole = changes.selectedRole.currentValue || changes.selectedRole;
      const selectedRoleDetail = this.roleDetails.find(p => p.role.key === (selectedRole.key || selectedRole));
      if (selectedRoleDetail) {
        this.selectedRole = selectedRoleDetail.role;
        this.selectedRoleDetail = selectedRoleDetail;
      } else {
        this.selectedRole = this.roles[this.roles.length - 1];
        this.selectedRoleDetail = this.roleDetails.find(p => p.role.key === this.selectedRole.key);
      }
    }
  }

  buildRoleDetails(): void {
    const allRoleDetails = [{
        role: LexRoles.MANAGER,
        description: 'can manage',
        icon: 'vcard'
      }, {
        role: LexRoles.CONTRIBUTOR,
        description: 'can edit',
        icon: 'pencil'
      }, {
        role: LexRoles.OBSERVER_WITH_COMMENT,
        description: 'can comment',
        icon: 'comment'
      }, {
        role: LexRoles.OBSERVER,
        description: 'can view',
        icon: 'eye'
      }, {
        role: LexRoles.NONE,
        description: 'disable',
        icon: 'ban'
      }
    ];

    this.roleDetails = allRoleDetails.filter(roleDetail => this.roles.includes(roleDetail.role));
  }

  selectRoleDetail(roleDetail: RoleDetail): void {
    if (this.selectedRoleDetail.role.key !== roleDetail.role.key) {
      this.selectedRoleDetail = roleDetail;
      this.onRoleChanged({ $event: { roleDetail, target: this.target } });
    }
  }

}

export const RoleDropdownComponent: angular.IComponentOptions = {
  bindings: {
    project: '<',
    session: '<',
    target: '<',
    roles: '<',
    selectedRole: '<',
    onOwnershipTransfer: '&',
    onRoleChanged: '&',
    onDeleteTarget: '&',
    userIsTechSupport: '&',
    currentUserIsOwnerOrAdmin: '&',
  },
  controller: RoleDropdownController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/role-dropdown.component.html'
};
