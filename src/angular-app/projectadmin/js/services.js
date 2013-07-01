'use strict';

/* Services */

// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('projectAdmin.services', [])
	.value('version', '0.1')
	.service('userService', ['$timeout', function($timeout) {
		this.read = function(id) {
	
		};
		this.update = function(model) {
	
		};
		this.remove = function(id) {
	
		};
		this.typeadhead = function(term, callback) {
			var result = {};
			result.ok = true;
			result.data = [ {
				'name' : 'Cambell',
				'username' : 'cambell',
				'email' : 'cambell@example.com'
			}, {
				'name' : 'John',
				'username' : 'john',
				'email' : 'john@example.com'
			}, {
				'name' : 'Bob',
				'username' : 'bob',
				'email' : 'bob@example.com'
			}, {
				'name' : 'Sam',
				'username' : 'sam',
				'email' : 'sam@example.com'
			}, {
				'name' : 'Sammy',
				'username' : 'sammy',
				'email' : 'sammy@example.com'
			}, {
				'name' : 'Samuel',
				'username' : 'samuel',
				'email' : 'samuel@example.com'
			}, {
				'name' : 'Samson',
				'username' : 'samson',
				'email' : 'samson@example.com'
			}, {
				'name' : 'Sonny',
				'username' : 'sonny',
				'email' : 'sonny@example.com'
			}, {
				'name' : 'Samantha',
				'username' : 'samantha',
				'email' : 'samantha@example.com'
			} ];
			$timeout(function() { callback(result); }, 300);
		};
	}])
	;
