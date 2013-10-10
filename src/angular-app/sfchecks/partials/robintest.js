'use strict';

angular.module(
		'sfchecks.robintest',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.jqte', 'ui.bootstrap', 'palaso.ui.selection', 'palaso.ui.notice' ]
	)
	.controller('RobinTestCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', 'breadcrumbService', 'silNoticeService',
	                              function($scope, $routeParams, questionService, ss, breadcrumbService, notice) {
		console.log("Testing tag layout");
	}])
	;
