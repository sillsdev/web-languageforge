'use strict';

angular.module('lexicon.settings', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.textdrop'])
.controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService', 'silNoticeService', 'lexProjectService', 'lexBaseViewService', 
                             function($scope, $filter, userService, ss, notice, lexProjectService, baseViewService) {
	$scope.rights.canEditCommunicationSettings = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
	baseViewService.setData(ss.session().projectSettings);
	
	$scope.readProject = function() {
		lexProjectService.readProject(function(result) {
			if (result.ok) {
				$.extend($scope.project, result.data.project);
			}
		});
	};
	
	$scope.readProject();
	
	$scope.updateProject = function() {
		lexProjectService.updateProject($scope.project, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $filter('translate')("{projectName} settings updated successfully", {projectName: $scope.project.projectName}));
			}
		});
	};
	
	$scope.settings = {
		'sms': {},
		'email': {}
	};
		
	$scope.readCommunicationSettings = function() {
		lexProjectService.readSettings(function(result) {
			if (result.ok) {
				$scope.settings.sms = result.data.sms;
				$scope.settings.email = result.data.email;
			}
		});
	};

	$scope.updateCommunicationSettings = function() {
		lexProjectService.updateSettings($scope.settings.sms, $scope.settings.email, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $filter('translate')("{projectName} SMS settings updated successfully", {projectName: $scope.project.projectName}));
			}
		});
	};
	
}])
;
