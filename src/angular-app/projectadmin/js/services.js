'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('projectAdmin.services', [])
	.value('version', '0.1')
	.service('userService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.

		this.read = function(id) {
	
		};
		this.update = function(model) {
	
		};
		this.remove = function(id) {
	
		};
		this.typeahead = function(term, callback) {
			jsonRpc.call('user_typeahead', [term], callback);
		};
	}])
	;
