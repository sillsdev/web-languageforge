'use strict';

/* Filters */

angular.module('activity.filters', []).
  filter('dateformat', function() {
  	return function(epochtime) {
  		return 'one hour ago';
  	};
  });
