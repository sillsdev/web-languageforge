// Note: this code was based on the notice service, and so it exists as a directive and service pair.  However, the broadcast message feature
// probably could have just as well been integrated into the project page controller without the added complexity of the service and directive - cjh
/*
angular.module('sfchecks.message', ['ui.bootstrap'])
.factory('messageService', ['$log', 'jsonRpc', function($log, jsonRpc) {
  var messages = [];
  return {
    push: function(id, message) {
      messages.push({id: id, message: message);
    },
    remove: function(id) {
      for (index in messages) {
        m = messages[index];
        if (m.id == id) {
          messages.splice(index, 1);
          break;
        }
      }
      jsonRpc.call('project_markMessageRead', [id], function() {});
    },
    get: function() {
      return notices;
    },
    set: function(messageArray) {
      messages = messageArray;
    }
  };
}])
.directive('broadcastMessages', ['messageService', '$log', function(messageService, $log) {
  return {
    restrict : 'EA',
    template : '<div class="notices"><alert ng-repeat="message in messages()" type="info" close="closeMessage(message.id)">{{message.message}}</alert></div>',
    replace : true,
    compile : function(tElement, tAttrs) {
      return function($scope, $elem, $attr) {
        $scope.closeMessage = function(id) {
          messageService.remove(id);
        };
        $scope.messages = function() {
          return messageService.get();
        };
      };
    }
  };
}]);
*/