import { ApiService, JsonRpcCallback } from './api.service';
import { IPromise, forEach } from 'angular';

export class RolesService {
  roles: IPromise<[number,string][]>;

  // Role names for the two "well-known" roles that should always exist
  _contributor: string | undefined;
  _manager: string | undefined;
  static defaultContributorRole: string = 'Contributor';
  static defaultManagerRole: string = 'Manager';
  get contributor(): string {
    return this._contributor || RolesService.defaultContributorRole;
  }
  get manager(): string {
    return this._manager || RolesService.defaultManagerRole;
  }

  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {
    this.roles = this.getAllRoles().then(result => {
      if (result.ok) {
        // Try to populate the well-known role names
        forEach(result.data, ([roleId, roleName]) => {
          if (typeof roleName === 'string') {
            const name = roleName.toLowerCase();
            switch (name) {
              case 'contributor':
              case 'contributer':
              case 'member':
                this._contributor = roleName;
                break;

              case 'manager':
              case 'owner':
                this._manager = roleName;
                break;
            }
          }
        });
        return result.data;
      } else {
        console.log(result);
        return [];
      }
    });
  }

  getAllRoles(callback?: JsonRpcCallback) {
    return this.api.call('ldapi_get_all_roles', [], callback);
  }
}
