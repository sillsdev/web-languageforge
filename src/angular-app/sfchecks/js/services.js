'use strict';

/* Services */

angular.module('sfchecks.services', [])
	.factory('breadcrumbs', ['$rootScope', '$routeParams', function($rootScope, $r) {
		
		var breadcrumbService = {};
		
		breadcrumbService.getAll = function() {
			var breadcrumb = {};
			var crumbs = [];
			var projectListLabel = "My Projects";
			var url = "#/project";
			breadcrumb.here = projectListLabel;
			crumbs.push({"label": projectListLabel, "url": url});
			if ($r.projectName) {
				url = url + "/" + encodeURIComponent($r.projectName) + "/" + $r.projectId;
				crumbs.push({"label": $r.projectName, "url": url});
				breadcrumb.here = $r.projectName;
			}
			if ($r.textName) {
				url = url + "/" + encodeURIComponent($r.textName) + "/" + $r.textId;
				crumbs.push({"label": $r.textName, "url": url});
				breadcrumb.here = $r.textName;
			}
			if ($r.questionName) {
				url = url + "/" + encodeURIComponent($r.questionName) + "/" + $r.questionId;
				crumbs.push({"label": $r.questionName, "url": url});
				breadcrumb.here = $r.questionName;
			}
			breadcrumbs.crumbs = crumbs;
			return breadcrumbs;
		}
		
		return breadcrumbService;
		
	}])
	;
