import * as angular from 'angular';

import { ErrorModule, ErrorService } from '../error.service';
import { ExceptionHandlingService } from '../exception-handling.service';

export interface JsonRpcResult extends angular.IHttpPromiseCallbackArg<any> {
  ok?: boolean;
}

export type JsonRpcCallback = (result?: JsonRpcResult) => void;

interface JsonRequest {
  version: string;
  method: string;
  params: any;
  id: number;
}

// Simple Angular service for making JSON-RPC easier from the client side

// Inspired by https://github.com/0xAX/angularjs-json-rpc/, but rewritten
// from scratch since that project doesn't specify a license. It's pretty
// simple code anyway.
export class JsonRpcService {
  lastId: number;

  static $inject: string[] = ['$http', '$window', 'error', 'exceptionHandler'];
  constructor(private $http: angular.IHttpService, private $window: angular.IWindowService, private error: ErrorService,
              private exceptionHandler: ExceptionHandlingService) {
    this.lastId = 0;
  }

  nextId(): number {
    return ++this.lastId;
  }

  /**
   * @param {string} url - The endpoint to send the request to
   * @param {string} method - The remote method to call
   * @param {Object} options - All properties on options are passed as
   * attributes to the params property of the request object.
   * @param {Array} remoteParams - Ordered parameters to send to remote procedure call
   * @param {function} callback - The callback will be called with an object
   * with the following properties:
   *   {boolean} ok - true for a 2xx code and false for a 3xx, 4xx or 5xx code
   *   The rest are the same as AngularJS's $http:
   *   - {string|Object} data
   *   - {number} - status
   *   - {function([headerName])} - headers
   *   - {Object} config
   */
  call(url: string, method: string, options: any, remoteParams: any[], callback: JsonRpcCallback) {
    const params: any = {};
    Object.keys(options).forEach(prop => {
      params[prop] = options[prop];
    });

    params.orderedParams = remoteParams;

    const jsonRequest: JsonRequest = {
      version: '2.0',
      method,
      params,
      id: this.nextId()
    };
    const httpRequest: angular.IRequestConfig = {
      url,
      method: 'POST',
      data: JSON.stringify(jsonRequest)
    };
    const result: JsonRpcResult | any = {};
    const request = this.$http(httpRequest);

    const requestSuccess = (response: angular.IHttpPromiseCallbackArg<any>) => {
      if (response.data === null) {
        // TODO error handling for jsonRpc CP 2013-07
        this.error.notify('RPC Error', 'data is null');
        return;
      }

      if (typeof response.data === 'string') {
        console.log(response.data);
        this.error.notify('RPC Error', response.data);
        return;
      }

      if (response.data.error !== null) {
        let type = '';
        switch (response.data.error.type) {
          case 'ResourceNotAvailableException':
            type = 'The requested resource is not available.';
            break;
          case 'UserNotAuthenticatedException':
            type = 'You\'re not currently signed in.';

            // redirect to login page with message
            this.error.error('You will now be redirected to the login page.');
            this.$window.location.href = '/auth/login';
            return;
          case 'UserUnauthorizedException':
            type = 'You don\'t have sufficient privileges.';
            break;
          default:
            // silently swallow unknown exceptions and don't bug (heh) the user about things they can't fix
            // this.error.notify('Exception',
            //   'An exception occurred in the application, but\nthe developers have already been notified.',
            //   response.data.error.message);
            return;
        }
        this.error.error(type, response.data.error.message);

        return;
      }

      if (response.data.error === null) {
        result.ok = true;
        result.data = response.data.result;
        result.status = response.status;
        result.headers = response.headers;
        result.config = response.config;
        if (callback) callback(result);
      }

    };

    const requestError = (response: any) => {
      // only report error if the browser/network is not OFFLINE and not timeout (status -1)
      // otherwise fail silently (the browser will console log a failed connection anyway)
      if (response.status > 0 && response.status !== '0') {
        // just absorb 502's, nothing the user can do about it.
        response.status !== 502 && this.error.notify('RPC Error', 'Server Status Code ' + response.status);
        result.ok = false;
        result.data = response.data;
        result.status = response.status;
        result.headers = response.headers;
        result.config = response.config;
        if (callback) callback(result);
      }
    };

    request.then(requestSuccess, requestError);

    return request;
  }

}

export const JsonRpcModule = angular
  .module('jsonRpc', [ErrorModule])
  .service('jsonRpc', JsonRpcService)
  .name;
