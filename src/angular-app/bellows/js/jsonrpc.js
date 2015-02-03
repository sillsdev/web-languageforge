// Simple Angular factory for making JSON-RPC easier from the client side

// Inspired by https://github.com/0xAX/angularjs-json-rpc/, but rewritten
// from scratch since that project doesn't specify a license. It's pretty
// simple code anyway.

var json_rpc = angular.module('jsonRpc', ['sf.error']);

json_rpc.factory('jsonRpc', ['$http', '$window', 'error', function($http, $window, error) {
	this.params = {};
	this.last_id = 0;
	
	this.next_id = function() {
		this.last_id = this.last_id + 1;
		return this.last_id;
	};
	
	this.connect = function(params) {
		if (typeof(params) == "string") {
			// We were called as connect("http://url/goes/here")
			params = {"url": params};
		}
		if (params.url === undefined || params.url === "") {
			throw "Valid URL required";
		}
		if (params.version === undefined) {
			params.version = "2.0";
		}
		this.params = params;
	};
	
	this.call = function(remote_func, remote_params, callback, id) {
		// remote_func should be a string
		// remote_params should be an object (e.g., {"param_name": "value"})
		// callback is the function that will be called on success or failure. It
		// should take a single parameter, a result object with five attributes:
		//   ok = boolean, true for a 2xx code and false for a 3xx, 4xx or 5xx code
		//   data, status, headers, config = as described in Angular's $http docs
		if (this.params.url === undefined) {
			throw "No URL: should use connect() before using call()";
		}
		if (id === undefined) {
			id = this.next_id();
		}
		var json_request = {
			"version": this.params.version,
			"method": remote_func,
			"params": remote_params,
			"id": id
		};
		var http_request = {
			"url": this.params.url,
			"method": "POST",
			"data": JSON.stringify(json_request),
			"headers": {"Content-Type": "application/json"} // Might not be necessary, since this appears to be the default for Angular's $http service
		};
		var result = {};
		var request = $http(http_request);
		this.requestsuccess = function(data, status, headers, config) {
			if (data == null) {
				// TODO error handling for jsonRpc CP 2013-07
				error.error('RPC Error', "data is null");
				
				return;
			}
			if (typeof data == 'string') {
				error.error('RPC Error', data);
				return;
			}
			if (data.error != null) {
				var type = '';
				switch(data.error.type) {
					case 'ResourceNotAvailableException':
						type = "The requested resource is not available.";
						break;
					case 'UserNotAuthenticatedException':
						type = "You're not currently signed in.";
						// redirect to login page with message
						error.error("You will now be redirected to the login page.");
						$window.location.href = "/login";
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
				(callback||angular.noop)(result);
			}
			
		};
		this.requesterror = function(data, status, headers, config) {
			if (status == 0 || status == "0") {
				// DEBUG
				console.log('Got RPC Error with server status code 0. Request details follow:');
				console.log('Status:', status);
				console.log('Headers:', headers);
				console.log('Config:', config);
				console.log('Data:', data);
				// Retry. This could potentially get into an infinite loop
				// if the request *keeps on* returning an error with status 0,
				// but that's not likely to happen.
				var new_json_request = json_request;
				new_json_request.id = this.next_id();
				var new_http_request = http_request;
				new_http_request.data = JSON.stringify(new_json_request);
				var new_request = $http(new_http_request);
				new_request.success(this.requestsuccess);
				new_request.error(this.requesterror);
			} else {
				error.error('RPC Error', "Server Status Code " + status);
				result.ok = false;
				result.data = data;
				result.status = status;
				result.headers = headers;
				result.config = config;
				(callback||angular.noop)(result);
			}
		};
		request.success(this.requestsuccess);
		request.error(this.requesterror);
		return request;
	};

	return this;
}]);
