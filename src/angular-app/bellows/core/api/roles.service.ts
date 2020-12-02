import { ApiService, JsonRpcCallback } from './api.service';
import { IPromise, forEach } from 'angular';
import { ProjectRoles, ProjectRole } from '../../shared/model/project.model';

// TODO: import ProjectRoles static class and use that

export class RolesService {
  roles: IPromise<[number,string][]>;

  // Role names for the two "well-known" roles that should always exist
  contributor: IPromise<string>;
  manager: IPromise<string>;
  techSupport: IPromise<string>;
  static defaultContributorRole = 'Contributor';
  static defaultManagerRole = 'Manager';
  // get contributor(): IPromise<string {
  //   return this._contributor || RolesService.defaultContributorRole;
  // }
  // get manager(): string {
  //   return this._manager || RolesService.defaultManagerRole;
  // }

  static lfContributorRole = ProjectRoles.CONTRIBUTOR;
  static lfManagerRole = ProjectRoles.MANAGER;
  static lfTechSupportRole = ProjectRoles.TECH_SUPPORT;

  ldRoleToLfRole(ldRole: string) : IPromise<ProjectRole> {
    ldRole = ldRole || '';
    return this.$q.all([this.contributor, this.manager, this.techSupport]).then(([contributor, manager, techSupport]) => {
      switch (ldRole) {
        case contributor:
          return RolesService.lfContributorRole;
        case manager:
          return RolesService.lfManagerRole;
        case techSupport:
          return RolesService.lfTechSupportRole;
        default:
          return { name: ldRole, key: (ldRole).toLowerCase() };
      }
    });
  }

  lfRoleToLdRole(lfRole: string) {
    lfRole = lfRole || '';
    return this.$q.all([this.contributor, this.manager, this.techSupport]).then(([contributor, manager, techSupport]) => {
      switch (lfRole) {
        case RolesService.lfContributorRole.key:
          return contributor;
        case RolesService.lfManagerRole.key:
          return manager;
        case RolesService.lfTechSupportRole.key:
          return techSupport;
        default:
          return lfRole;
      }
    });
  }

  static $inject: string[] = ['apiService', '$q'];
  constructor(private api: ApiService, private $q: angular.IQService) {
    const contributorD = $q.defer<string>();
    const managerD = $q.defer<string>();
    const techSupportD = $q.defer<string>();
    this.contributor = contributorD.promise;
    this.manager = managerD.promise;
    this.techSupport = techSupportD.promise;
    this.roles = this.getAllRoles().then(result => {
      if (result.ok) {
        var contributorFound = false;
        var managerFound = false;
        var techSupportFound = false;
        console.log("Roles service got", result.data);
        // Try to populate the well-known role names
        forEach(result.data, ([roleId, roleName]) => {
          if (typeof roleName === 'string') {
            const name = roleName.toLowerCase();
            switch (name) {
              case 'contributor':
              case 'contributer':
              case 'member':
                contributorFound = true;
                contributorD.resolve(roleName);
                break;

              case 'manager':
              case 'owner':
                managerFound = true;
                managerD.resolve(roleName);
                break;

              case 'languagedepotprogrammer':
              case 'techsupport':
              case 'tech support':
              case 'technicalsupport':
              case 'technical support':
              case 'developer':
                techSupportFound = true;
                techSupportD.resolve(roleName);
                break;
            }
          }
        });
        if (!contributorFound) {
          contributorD.reject('No contributor role found!');
        }
        if (!managerFound) {
          managerD.reject('No manager role found!');
        }
        if (!techSupportFound) {
          techSupportD.reject('No tech support role found!');
        }
        return result.data;
      } else {
        contributorD.reject('No roles found!');
        managerD.reject('No roles found!');
        techSupportD.reject('No roles found!');
        console.log(result);
        return [];
      }
    });
  }

  getAllRoles(callback?: JsonRpcCallback) {
    return this.api.call('ldapi_get_all_roles', [], callback);
  }
}
