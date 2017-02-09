angular.module('sgw.ui.breadcrumb', [])
.factory('breadcrumbService', ['$log', function($log) {
  var service = {};
  var ensureIdIsRegistered = function(id) {
    if (angular.isUndefined(service[id])) {
      service[id] = [];
    }
  };
  return {
    updateCrumb: function(id, index, update) {
      ensureIdIsRegistered(id);
      var crumb = service[id][index];
      for (var property in update) {
        crumb[property] = update[property];
      }
    },
    set: function(id, crumbs) {
      ensureIdIsRegistered(id);
      service[id] = crumbs;
    },
    get: function(id) {
      ensureIdIsRegistered(id);
//      return angular.copy(service[id]);
      return service[id];
    },
    setLastIndex: function(id, index) {
      ensureIdIsRegistered(id);
      if (service[id].length > 1 + index) {
        service[id].splice(1 + index, service[id].length - index);
      }
    }
  };
}])
.directive('breadcrumbs', ['breadcrumbService', '$log', function(breadcrumbService, $log) {
  return {
    restrict : 'A',
    template : '<ol class="breadcrumb"><li class="breadcrumb-item" ng-repeat="bc in breadcrumbs" ng-class="{active: $last}" ng-switch="$last"><span ng-switch-when="false"><a ng-click="unregisterBreadCrumb( $index )" ng-href="{{bc.href}}">{{bc.label}}</a></span><span ng-switch-default>{{bc.label}}</span></li></ol>',
    replace : true,
    compile : function(tElement, tAttrs) {
      return function($scope, $elem, $attr) {
        var breadcrumbId = $attr['id'];
        var resetCrumbs = function(breadcrumbs) {
          $scope.breadcrumbs = [];
          angular.forEach(breadcrumbs, function(v) {
            $scope.breadcrumbs.push(v);
          });
        };
//        resetCrumbs();
        $scope.unregisterBreadCrumb = function(index) {
          breadcrumbService.setLastIndex(breadcrumbId, index);
//          resetCrumbs();
        };
        $scope.$watch(function() { return breadcrumbService.get(breadcrumbId); }, function(breadcrumbs) {
          resetCrumbs(breadcrumbs);
        }, true);
        // $scope.$on( 'breadcrumbsRefresh',
        // function() {
        // $log.log( "$on" );
        // resetCrumbs();
        // } );
      };
    }
  };
}]);
