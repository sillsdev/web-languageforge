'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.comment', 'ngAnimate', 'palaso.ui.notice'])
// DBE controller
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, userService, sessionService, modal, notice) {
	$scope.terms = [
	                 {'source': 'Planet',
	                  'translation': ''},
	                 {'source': 'Earth',
	                  'translation': ''},
	                 {'source': 'Moon™',
	                  'translation': ''}
	               ];
}]);
