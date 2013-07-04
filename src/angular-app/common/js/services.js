'use strict';

// Services
// ScriptureForge common services
angular.module('sf.services', [])
	.service('userService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.

		this.read = function(id, callback) {
			jsonRpc.call('user_read', [id], callback);
		};
		this.update = function(model, callback) {
			jsonRpc.call('user_update', [model], callback);
		};
		this.remove = function(id, callback) {
			jsonRpc.call('user_remove', [id], callback);
		};
		this.typeahead = function(term, callback) {
			jsonRpc.call('user_typeahead', [term], callback);
		};
		this.updatePassword = function(password, callback) {
			jsonRpc.call('user_updatePassword', [password], callback);
		}
	}])
	;
