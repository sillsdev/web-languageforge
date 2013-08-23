'use strict';

/* Filters */

angular.module('activity.filters', []).
  filter('relativetime', function() {
  	return function(timestamp) {
  		// see http://momentjs.com/docs/
  		return moment(timestamp).fromNow();
  	};
  });
