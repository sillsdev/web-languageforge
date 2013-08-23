'use strict';

/* Services */

angular.module('sfchecks.services', [])
	.factory('breadcrumbService', ['$rootScope', '$routeParams', function($rootScope, $r) {
		
		var breadcrumbService = {};
		
		breadcrumbService.idmap = {};
		
		breadcrumbService.read = function() {
			var crumbs = [];
			var url = "#/project";
			if ($r.projectId && this.idmap[$r.projectId]) {
				url = url + "/" + $r.projectId;
				crumbs.push({"label": this.idmap[$r.projectId].name, "url": url, 'type':'project'});
			}
			if ($r.textId && this.idmap[$r.textId]) {
				url = url + "/" + $r.textId;
				crumbs.push({"label": this.idmap[$r.textId].name, "url": url, 'type':'text'});
			}
			if ($r.questionId && this.idmap[$r.questionId]) {
				url = url + "/" + $r.questionId;
				crumbs.push({"label": this.idmap[$r.questionId].name, "url": url, 'type':'question'});
			}
			return crumbs;
		};
		
		breadcrumbService.updateMap = function(type, id, name) {
			breadcrumbService.idmap[id] = {
				'type': type,
				'name': name
			};
		};
		
		return breadcrumbService;
		
	}]);