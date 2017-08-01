import * as angular from 'angular';
import moment = require('moment');

/* Filters */

angular.module('bellows.filters', [])
  .filter('bytes', function() {
    return function(bytes: any, precision: number) {
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }
      const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
      let number = Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    };
  })
  .filter('relativetime', function() {
    return function(timestamp: string, timeFormat: string) {
      // see http://momentjs.com/docs/
      let timeAgo = moment(timestamp, timeFormat);
      if (timeAgo.isValid()) {
        return timeAgo.fromNow();
      }
      return '';
    };
  })

  ;
