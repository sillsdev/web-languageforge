import * as angular from 'angular';

import { SessionService } from '../session.service';

export class RestApiService {
  static $inject: string[] = ['$http', 'sessionService'];
  constructor(private $http: angular.IHttpService, private sessionService: SessionService) { }

  get<T>(url: string, data?: any): angular.IPromise<T> {
    return this.send<T>('GET', url, data);
  }

  post<T>(url: string, data?: any): angular.IPromise<T> {
    return this.send<T>('POST', url, data);
  }

  delete<T>(url: string, data?: any): angular.IPromise<T> {
    return this.send<T>('DELETE', url, data);
  }

  private send<T>(method: string, url: string, data: any): angular.IPromise<T> {
    return this.sessionService.getSession()
      .then(session => {
        const httpConfig = { method, url, data, headers: { Authorization: 'Bearer ' + session.accessToken() }};
        return this.$http<T>(httpConfig);
      }).then(arg => {
        return arg.status === 204 ? null : arg.data;
      });
  }
}
