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
	semdomSetupApi.getStartedProjects(function(result) {
		if (result.ok) {
			$scope.startedProjects = result.data;
		}
	});
	
	semdomSetupApi.getUnstartedProject(function(result) {
		if (result.ok) {
			$scope.unstartedProjects = result.data;
		}
	});
		
	$scope.showModal = function(project, option) {
		$scope.selectedProject = project;
		$scope.modalShowing = option;
		
		if (option == 1) {
			$scope.modalTitle = "Join Project";
			$scope.modalBody = "Do you want to submit a request to join the " + project.language + " project?"
		} else if (option == 2) {
			$scope.modalTitle = "Create Project";
			$scope.modalBody = "Do you want to create the " + project.language + " project?"
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
		
		$scope.modalShowing = 0;
	}
	
	$scope.createProject =  function() {
		var id = $scope.selectedProject.id;
		semdomSetupApi.createProject(0, id, 1, function(result) {
			if (result.ok && result.success) {
	 	 		$state.go("edit", {'source' : 0, 'target': id});
		 	}
		});

	};
	
	$scope.submitJoinRequest = function() {
		var id = $scope.selectedProject.id;
		semdomSetupApi.createProject(0, id, 1, function(result) {
			if (result.ok && result.success) {
	 	 		$state.go("edit", {'source' : 0, 'target': id});
		 	}
		});
	};
	
}]);
