'use strict';

/* Filters */

angular.module('sfAdmin.filters', [])
  .filter('epoch2date', function() {
    return function(text) {
      var d = new Date(text * 1000);
      return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDay();
    };
  });
