angular.module('sfchecks.message', ['ui.bootstrap'])
.factory('messageService', ['$log', function($log) {
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
		},
		get: function() {
			return notices;
		},
		set: function(messageArray) {
			messages = messageArray;
		}
	};
}])
.directive('silMessageService', ['silMessageService', '$log', function(messageService, $log) {
	return {
		restrict : 'EA',
		template : '<div class="notices"><alert ng-repeat="message in messages()" type="info" close="closeMessage(message.id)">{{message.message}}</alert></div>',
		scope : {
			markRead : "="
		},
		replace : true,
		compile : function(tElement, tAttrs) {
			return function($scope, $elem, $attr) {
				$scope.closeMessage = function(id) {
					messageService.remove(id);
					// mark message read on server here via directive-provided method
					markRead(id);
				};
				$scope.messages = function() {
					return messageService.get();
				};
			};
		}
	};
}]);