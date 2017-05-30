'use strict';

// Simple Angular factory for making JSON-RPC easier from the client side

// Inspired by https://github.com/0xAX/angularjs-json-rpc/, but rewritten
// from scratch since that project doesn't specify a license. It's pretty
// simple code anyway.

angular.module('jsonRpc', ['sf.error'])
  .factory('jsonRpc', ['$http', '$window', 'error', function ($http, $window, error) {
    this.params = {};
    this.last_id = 0;

    this.next_id = function () {
      this.last_id = this.last_id + 1;
      return this.last_id;
    };

    this.connect = function (params) {
      if (typeof (params) === 'string') {
        // We were called as connect("http://url/goes/here")
        params = { url: params };
      }

      if (params.url === undefined || params.url === '') {
        throw 'Valid URL required';
      }

      if (params.version === undefined) {
        params.version = '2.0';
      }

      this.params = params;
    };

    this.call = function (remoteFunction, remoteParams, callback, id) {
      // remoteFunction should be a string
      // remoteParams should be an object (e.g., {"paramName": "value"})
      // callback is the function that will be called on success or failure. It
      // should take a single parameter, a result object with five attributes:
      //   ok = boolean, true for a 2xx code and false for a 3xx, 4xx or 5xx code
      //   data, status, headers, config = as described in Angular's $http docs
      if (this.params.url === undefined) {
        throw 'No URL: should use connect() before using call()';
      }

      if (id === undefined) {
        id = this.next_id();
      }

      var jsonRequest = {
        version: this.params.version,
        method: remoteFunction,
        params: remoteParams,
        id: id
      };
      var httpRequest = {
        url: this.params.url,
        method: 'POST',
        data: JSON.stringify(jsonRequest),

        // Might not be necessary, since this appears to be the default for Angular's $http service
        headers: { 'Content-Type': 'application/json' }
      };
      var result = {};
      var request = $http(httpRequest);
      this.requestSuccess = function (response) {
        if (response.data === null) {
          // TODO error handling for jsonRpc CP 2013-07
          error.error('RPC Error', 'data is null');

          return;
        }

        if (typeof response.data === 'string') {
          error.error('RPC Error', response.data);
          return;
        }

        if (response.data.error !== null) {
          var type = '';
          switch (response.data.error.type) {
            case 'ResourceNotAvailableException':
              type = 'The requested resource is not available.';
              break;
            case 'UserNotAuthenticatedException':
              type = "You're not currently signed in.";

              // redirect to login page with message
              error.error('You will now be redirected to the login page.');
              $window.location.href = '/auth/login';
              return;
              break;
            case 'UserUnauthorizedException':
              type = "You don't have sufficient privileges.";
              break;
            default:
              type = 'Exception';
          }
          error.error(type, response.data.error.message);

          return;
        }

        if (response.data.error === null) {
          result.ok = true;
          result.data = response.data.result;
          result.status = response.status;
          result.headers = response.headers;
          result.config = response.config;
          (callback || angular.noop)(result);
        }

      };

      this.requestError = function (response) {
        // only report error if the browser/network is not OFFLINE and not timeout (status -1)
        // otherwise fail silently (the browser will console log a failed connection anyway)
        if (response.status > 0 && response.status !== '0') {
          error.error('RPC Error', 'Server Status Code ' + response.status);
          result.ok = false;
          result.data = response.data;
          result.status = response.status;
          result.headers = response.headers;
          result.config = response.config;
          (callback || angular.noop)(result);
        }
      };

      request.then(this.requestSuccess, this.requestError);

      return request;
    };

    return this;
  }]);
