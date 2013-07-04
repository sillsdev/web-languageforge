'use strict';

/* Filters */

angular.module('sfAdmin.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('epoch2date', function() {
  	return function(text) {
  		var d = new Date(text * 1000);
  		return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay();
  	}
  });
