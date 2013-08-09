'use strict';

/* Filters */

angular.module('activity.filters', []).
  filter('relativetime', function() {
  	return function(epochtime) {
  		// see http://momentjs.com/docs/
  		return moment.unix(parseInt(epochtime)).fromNow();
  	};
  });
