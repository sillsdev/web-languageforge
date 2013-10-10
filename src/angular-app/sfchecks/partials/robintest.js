'use strict';

angular.module(
		'sfchecks.robintest',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.jqte', 'ui.bootstrap', 'palaso.ui.selection', 'palaso.ui.notice' ]
	)
	.controller('RobinTestCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', 'breadcrumbService', 'silNoticeService',
	                              function($scope, $routeParams, questionService, ss, breadcrumbService, notice) {
		console.log("Testing tag layout");
		$scope.tags = ["First", "Second", "Third", "Fourth"];

		$scope.addTag = function(tag) {
			$scope.tags.push(tag);
		}
		$scope.addTag("DEBUG: And another one");

		$scope.removeTag = function(tagIndex) {
			$scope.tags.splice(tagIndex, 1);
		}
	}])
	;
