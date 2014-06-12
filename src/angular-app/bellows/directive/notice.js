angular.module('palaso.ui.notice', ['ui.bootstrap', 'bellows.services', 'ngAnimate'])
.factory('silNoticeService', ['$interval', 'utilService', function($interval, util) {
	var notices = [];
	var timers = {};
	
	var getIndexById = function(id) {
		for (var i=0; i<notices.length; i++) {
			if (notices[i].id == id) {
				return i;
			}
		}
	};
	return {
		push: function(type, message) {
			var id = util.uuid();
			if (type() == this.SUCCESS()) {
				// success alert messages will auto-close after 10 seconds
				var localFactory = this;
				timers[id] = $interval(function() {localFactory.removeById(id); }, 10 * 1000, 1);
			}
			notices.push({type: type(), message: message, id: id});
		},
		removeById: function(id) {
			this.remove(getIndexById(id));
			if (id in timers) {
				$interval.cancel(timers[id]);
			}
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
.directive('silNotices', ['silNoticeService', function(noticeService) {
	return {
		restrict : 'EA',
		template : '<div class="notices"><alert class="animate-repeat" ng-repeat="notice in notices()" type="notice.type" close="closeNotice(notice.id)">{{notice.message}}</alert></div>',
		replace : true,
		compile : function(tElement, tAttrs) {
			return function($scope, $elem, $attr) {
				$scope.closeNotice = function(id) {
					noticeService.removeById(id);
				};
				$scope.notices = function() {
					return noticeService.get();
				};
			};
		}
	};
}]);