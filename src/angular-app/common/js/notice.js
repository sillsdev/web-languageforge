angular.module('palaso.ui.notice', ['ui.bootstrap'])
.factory('silNoticeService', ['$log', function($log) {
	var notices = [];
	return {
		push: function(type, message) {
			notices.push({type: type(), message: message});
		},
		remove: function(index) {
			notices.splice(index, 1);
		},
		get: function() {
			return notices;
		},
		ERROR:   function() { return 'error'; },
		WARN:    function() { return 'warn'; },
		INFO:    function() { return 'info'; },
		SUCCESS: function() { return 'success'; },
	};
}])
.directive('silNotices', ['silNoticeService', '$log', function(noticeService, $log) {
	return {
		restrict : 'EA',
		template : '<div class="notices"><alert ng-repeat="notice in notices()" type="notice.type" close="closeNotice($index)">{{notice.message}}</alert></div>',
		replace : true,
		compile : function(tElement, tAttrs) {
			return function($scope, $elem, $attr) {
				$scope.closeNotice = function(index) {
					noticeService.remove(index);
				};
				$scope.notices = function() {
					return noticeService.get();
				};
			};
		}
	};
}]);