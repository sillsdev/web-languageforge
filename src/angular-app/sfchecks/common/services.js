'use strict';

/* Services */

angular.module('sfchecks.services', [])
	.factory('breadcrumbService', ['$rootScope', '$routeParams', function($rootScope, $r) {
		
		var breadcrumbService = {};
		
		breadcrumbService.read = function() {
			var crumbs = [];
			var url = "#/project";
			if ($r.projectName) {
				url = url + "/" + encodeURIComponent($r.projectName) + "/" + $r.projectId;
				crumbs.push({"label": $r.projectName, "url": url});
			}
			if ($r.textName) {
				url = url + "/" + encodeURIComponent($r.textName) + "/" + $r.textId;
				crumbs.push({"label": $r.textName, "url": url});
			}
			if ($r.questionName) {
				url = url + "/" + encodeURIComponent($r.questionName) + "/" + $r.questionId;
				crumbs.push({"label": $r.questionName, "url": url});
			}
			return crumbs;
		};
		
		return breadcrumbService;
		
	}]);