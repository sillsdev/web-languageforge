import * as angular from 'angular';

import { ParatextUserInfo } from '../../shared/model/paratext-user-info.model';
import { RestApiService } from './rest-api.service';

export class UserRestApiService {
  static $inject: string[] = ['restApiService'];
  constructor(private restApiService: RestApiService) { }

  getParatextInfo(userId: string): angular.IPromise<ParatextUserInfo> {
    return this.restApiService.get('/api2/users/' + userId + '/paratext');
  }
}
