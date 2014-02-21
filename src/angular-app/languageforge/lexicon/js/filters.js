'use strict';

/* Filters */

angular.module('lexicon.filters', [])
	.filter('orderAsArray', function() {
		return function(obj, keyName) {
			var result = [];
			angular.forEach(obj, function(val, key) {
				// if keyName defined, include key in val object
				if (keyName) {
					val[keyName] = key;
				}
				result.push(val);
			});
			return result;
		};
	})
	;
