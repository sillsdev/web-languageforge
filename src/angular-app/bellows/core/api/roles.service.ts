import { ApiService, JsonRpcCallback } from './api.service';
import { IPromise } from 'angular';

export class RolesService {
  roles: IPromise<[number,string][]>;

  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {
    this.roles = this.getAllRoles().then(result => {
      if (result.ok) {
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
