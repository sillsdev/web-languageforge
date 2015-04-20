'use strict';

/* Filters */

angular.module('bellows.filters', [])
.filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  };
})
.filter('relativetime', function() {
  return function(timestamp, timeFormat) {
    // see http://momentjs.com/docs/
    var timeAgo = moment(timestamp, timeFormat);
    if (timeAgo.isValid()) {
      return timeAgo.fromNow();
    }
    return '';
  };
});
;
