// Simple Angular factory for making JSON-RPC easier from the client side

// Inspired by https://github.com/0xAX/angularjs-json-rpc/, but rewritten
// from scratch since that project doesn't specify a license. It's pretty
// simple code anyway.

var json_rpc = angular.module('jsonRpc', ['sf.error']);

json_rpc.factory('jsonRpc', ['$http', 'error', function($http, error) {
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
		request.success(function(data, status, headers, config) {
			if (data == null) {
				// TODO error handling for jsonRpc CP 2013-07
				return;
			}
			if (typeof data == 'string') {
				error.error('RPC Error', data);
				return;
			}
			if (data.error != null) {
				// TODO error handling for jsonRpc CP 2013-07
				error.error('RPC Error', data.error);
				return;
			}
			if (data.error == null) {
				result.ok = true;
				result.data = data.result;
				result.status = status;
				result.headers = headers;
				result.config = config;
				callback(result);
			}
			
		});
		request.error(function(data, status, headers, config) {
			result.ok = false;
			result.data = data;
			result.status = status;
			result.headers = headers;
			result.config = config;
			callback(result);
		});
		return request;
	};
	return this;
}]);
