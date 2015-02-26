'use strict';

/* Filters */

angular.module('sfchecks.filters', [])
  .filter('urlencode', function() {
    return function(text) {
      return encodeURIComponent(text);
    };
  })
  .filter('urldecode', function() {
    return function(text) {
      return decodeURIComponent(text);
    };
  })
  .filter('bytes', function() {
    return function(bytes, precision) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }
      var units = [ 'bytes', 'kB', 'MB', 'GB', 'TB', 'PB' ];
      var number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
  })
  ;
