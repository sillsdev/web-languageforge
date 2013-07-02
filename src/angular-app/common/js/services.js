'use strict';

// Services
// ScriptureForge common services
angular.module('sf.services', [])
	.service('userService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.

		this.read = function(id, callback) {
	
		};
		this.update = function(model, callback) {
	
		};
		this.remove = function(id, callback) {
	
		};
		this.list = function(callback) {
			jsonRpc.call('user_list', [], callback);
		};
		this.typeahead = function(term, callback) {
			jsonRpc.call('user_typeahead', [term], callback);
		};
	}])
	;
