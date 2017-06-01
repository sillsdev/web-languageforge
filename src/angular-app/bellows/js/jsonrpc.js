// Simple Angular factory for making JSON-RPC easier from the client side

// Inspired by https://github.com/0xAX/angularjs-json-rpc/, but rewritten
// from scratch since that project doesn't specify a license. It's pretty
// simple code anyway.

angular.module('jsonRpc', ['sf.error'])
  .factory('jsonRpc', ['$http', '$window', 'error', function ($http, $window, error) {
    this.lastId = 0;

    this.nextId = function () {
      return ++this.lastId
    };

    /**
     * @param {string} url - The endpoint to send the request to
     * @param {string} method - The remote method to call
     * @param {Object} options - All properties on options are passed as
     * attributes to the params property of the request object.
     * @param {Array} remoteParams - Ordered prameters to send to remote procedure call
     * @param {function} callback - The callback will be called with an object
     * with the following properties:
     *   {boolean} ok - true for a 2xx code and false for a 3xx, 4xx or 5xx code
     *   The rest are the same as AngularJS's $http:
     *   - {string|Object} data
     *   - {number} - status
     *   - {function([headerName])} - headers
     *   - {Object} config
     */
    this.call = function (url, method, options, remoteParams, callback) {

      var params = {};
      Object.keys(options).forEach(function(prop) {
        params[prop] = options[prop];
      });
      params.orderedParams = remoteParams;

      var jsonRequest = {
        version: '2.0',
        method: method,
        params: params,
        id: this.nextId()
      };
      var httpRequest = {
        url: url,
        method: 'POST',
        data: JSON.stringify(jsonRequest),

        // Might not be necessary, since this appears to be the default for Angular's $http service
        headers: { 'Content-Type': 'application/json' }
      };
      var result = {};
      var request = $http(httpRequest);
      this.requestsuccess = function (data, status, headers, config) {
        if (data == null) {
          // TODO error handling for jsonRpc CP 2013-07
          error.error('RPC Error', 'data is null');
          return;
        }

        if (typeof data == 'string') {
          error.error('RPC Error', data);
          return;
        }

        if (data.error != null) {
          var type = '';
          switch (data.error.type) {
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
          error.error(type, data.error.message);

          return;
        }

        if (data.error == null) {
          result.ok = true;
          result.data = data.result;
          result.status = status;
          result.headers = headers;
          result.config = config;
          (callback || angular.noop)(result);
        }

      };

      this.requesterror = function (data, status, headers, config) {
        // only report error if the browser/network is not OFFLINE and not timeout (status -1)
        // otherwise fail silently (the browser will console log a failed connection anyway)
        if (status > 0 && status != '0') {
          error.error('RPC Error', 'Server Status Code ' + status);
          result.ok = false;
          result.data = data;
          result.status = status;
          result.headers = headers;
          result.config = config;
          (callback || angular.noop)(result);
        }
      };

      request.success(this.requestsuccess);
      request.error(this.requesterror);
      return request;
    };

    return this;
  }]);
