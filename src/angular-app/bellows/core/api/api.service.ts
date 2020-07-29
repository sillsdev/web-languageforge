import * as angular from 'angular';

import { JsonRpcCallback, JsonRpcResult, JsonRpcService } from './json-rpc.service';

export { JsonRpcCallback, JsonRpcResult } from './json-rpc.service';
export type ApiMethod<T> = () => angular.IPromise<T>;

export class ApiService {
  projectId: string;
  isProduction: boolean;

  static $inject: string[] = ['jsonRpc', '$q', '$window'];
  constructor(private jsonRpc: JsonRpcService, private $q: angular.IQService, private $window: angular.IWindowService) {
    const projectIdMatch = $window.location.pathname.match(/^\/app\/[a-z]+\/([a-z0-9]{24,})\/?$/i);
    this.projectId = (projectIdMatch === null) ? undefined : projectIdMatch[1];
    this.isProduction = !/\.local$/.test($window.location.hostname);
  }

  call<T>(method: string, args?: any[], callback?: JsonRpcCallback<T>): angular.IPromise<JsonRpcResult<T>> {
    const options = {
      projectId: this.projectId
    };

    return this.$q((resolve, reject) => {
      this.jsonRpc.call('/api/sf', method, options, args || [], (result: JsonRpcResult<T>) => {
        if (callback) callback(result);

        result.ok ? resolve(result) : reject(result);
      });
    });
  }

  /**
   * @deprecated in TypeScript (Ok still in JS). Use 'call' directly so the method signature is defined
   * @param {string} method
   * @returns {ApiMethod<T>}
   */
  method<T>(method: string): ApiMethod<T> {
    // cannot be an arrow function as that doesn't support use of 'arguments'
    return function(): angular.IPromise<JsonRpcResult<T>> {
      // convert to array
      const args = [].slice.call(arguments);
      let callback: JsonRpcCallback<T>;
      if (typeof args[args.length - 1] === 'function') {
        callback = args.pop();
      }

      return this.call(method, args, callback);
    }.bind(this);
  }

}
