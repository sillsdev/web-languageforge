'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('projectAdmin.services', [])
	.value('version', '0.1')
	.value('users', [
       {'name': 'Cambell', 'username': 'cambell', 'email': 'cambell@example.com'},
       {'name': 'John', 'username': 'john', 'email': 'john@example.com'},
       {'name': 'Bob', 'username': 'bob', 'email': 'bob@example.com'},
       {'name': 'Sam', 'username': 'sam', 'email': 'sam@example.com'},
       {'name': 'Sammy', 'username': 'sammy', 'email': 'sammy@example.com'},
       {'name': 'Samuel', 'username': 'samuel', 'email': 'samuel@example.com'},
       {'name': 'Samson', 'username': 'samson', 'email': 'samson@example.com'},
       {'name': 'Sonny', 'username': 'sonny', 'email': 'sonny@example.com'},
       {'name': 'Samantha', 'username': 'samantha', 'email': 'samantha@example.com'}
     ])
  ;
