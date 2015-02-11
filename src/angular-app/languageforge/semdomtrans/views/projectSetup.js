'use strict';

angular.module('semdomtrans.projectSetup', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('projectSetupCtrl', ['$scope', '$state', 'semdomtransSetupService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $state, semdomSetupApi, sessionService, modal, notice) {
	$scope.canJoin = false;
	$scope.canCreate = false;
	$scope.modalShowing = 0;
	$scope.selectedID = -1;
	$scope.modalTitle = "";
	$scope.modalBody = "";
	semdomSetupApi.getOpenProjects(function(result) {
		if (result.ok) {
			$scope.openProjects = result.data;
		}
	});
		
	$scope.showModal = function(project, option) {
		$scope.selectedProject = project;
		$scope.modalShowing = option;
		
		if (option == 1) {
			$scope.modalTitle = "Join Project";
			$scope.modalBody = "Do you want to submit a request to join the " + project.projectCode + " project?"
		} else if (option == 2) {
			$scope.modalTitle = "Create Project";
			$scope.modalBody = "Do you want to create the " + project.projectCode + " project?"
		}
	}
	
	$scope.modalHide = function() {
		$scope.modalShowing = 0;
	}
	
	$scope.modalAccept = function() {
		if ($scope.modalShowing == 1) {
			$scope.submitJoinRequest();
		}
		else if ($scope.modalShowing == 2) {
			$scope.createProject();
		}
		
		$
	}
	
	$scope.modalAccept = function() {
		var id = $scope.selectedProject;
		$scope.modalShowing = 0;
		$state.go("edit", {'projectCode' : $scope.selectedProject.projectCode });
	}
	
	
}]);
