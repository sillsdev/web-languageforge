'use strict';

// ScriptureForge Error Service
angular.module('sf.error', [])
	.service('error', ['$log', function($log) {

		this.error = function(title, message) {
			$log.error('Error: ' + title + ' - ' + message);
		};
	}])
	;