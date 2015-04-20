'use strict';

/* Filters */

angular.module('lexicon.filters', [])
  .filter('orderAsArray', function() {
    return function(obj, keyName) {
      var result = [];
      angular.forEach(obj, function(val, key) {
        var newVal = angular.copy(val);
        // if keyName defined, include key in val object
        if (keyName) {
          newVal[keyName] = key;
        }
        result.push(newVal);
      });
      return result;
    };
  })
  .filter('relativetime', function() {
      return function(timestamp) {
        // see http://momentjs.com/docs/
        return moment(timestamp).fromNow();
      };
  })
  ;
