'use strict';

angular.module('palaso.ui.picklistEditor', ['angular-sortable-view'])
.directive('onEnter', function() {
  return function(scope, elem, attrs) {
    elem.bind('keydown keypress', function(evt) {
      if (evt.which == 13) {
        scope.$apply(function() {
          scope.$eval(attrs.onEnter, {thisElement: elem, event: evt});
        });
        evt.preventDefault();
      }
    });
  };
})
// see http://stackoverflow.com/questions/17089090/prevent-input-from-setting-form-dirty-angularjs
.directive('noDirtyCheck', function() {
  // Interacting with input elements having this directive won't cause the
  // form to be marked dirty.
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      elm.focus(function() {
          ctrl.$pristine = false;
      });
    }
  }
})
.directive('picklistEditor', function() {
  return {
    restrict: 'AE',
    templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/picklist-editor.html',
    scope: {
      items: '=',
      defaultKey: '=?',
      pristineItems: '=?'
      //keyFunc: '&',  // TODO: Figure out how to let the user *optionally* specify a key function. 2014-06 RM
    },
    controller: ['$scope', function($scope) {
      $scope.defaultKeyFunc = function(value) {
        return value.replace(/ /gi, '_');
      };

      $scope.showDefault = angular.isDefined($scope.defaultKey);

      $scope.deletableIndexes = [];

      $scope.pickAddItem = function() {
        if ($scope.newValue) {
          var keyFunc = $scope.keyFunc || $scope.defaultKeyFunc;
          var key = keyFunc($scope.newValue);
          $scope.items.push({key: key, value: $scope.newValue});
          $scope.deletableIndexes.push($scope.items.length - 1);
          $scope.newValue = undefined;
        }
      };

      $scope.pickRemoveItem = function(index) {
        // Remove index from deletableIndexes, shift all indexes *after* it up by 1
        $scope.deletableIndexes = $scope.deletableIndexes.map(function (i) {
          if (i === index) return -1;
          else if (i < index) return i;
          else return i - 1;
        }).filter(function (i) {return i !== -1});
        $scope.items.splice(index, 1);
      };

      // only unsaved items can be removed
      // TODO: implement search and replace to allow remove on any item. IJH 2015-03
      $scope.showRemove = function showRemove(index) {
        return ($scope.deletableIndexes.indexOf(index) != -1);
      };

      $scope.onSort = function onSort(indexFrom, indexTo) {
        if (indexFrom === indexTo) {
          return; // Nothing to do
        }
        // Ensure deletableIndexes stays up-to-date with the reordered items
        var lo = Math.min(indexFrom, indexTo);
        var hi = Math.max(indexFrom, indexTo);
        $scope.deletableIndexes = $scope.deletableIndexes.map(function (i) {
          // Items before or after the rearranged block don't need to be touched
          if ((i < lo) || (i > hi)) {
            return i;
          } else if (i === indexFrom) {
            return indexTo;
          } else {
            if (indexFrom > indexTo) {
              // Something moved back, other items shift forward
              return i + 1;
            } else {
              // Something moved forward, other items shift back
              return i - 1;
            }
          }
        });
      };

      $scope.blur = function(elem) {
        elem.blur();
      };
    }],
  };
});
