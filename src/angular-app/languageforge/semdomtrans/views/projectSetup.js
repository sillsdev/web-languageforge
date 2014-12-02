'use strict';

angular.module('semdomtrans.projectSetup', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('projectSetupCtrl', ['$scope', '$state', 'semdomtransSetupService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $state, semdomSetupApi, sessionService, modal, notice) {
	$scope.canJoin = false;
	$scope.canCreate = false;
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
		
	$scope.clickCreate =  function(project) {
			
	    var deletemsg = "Are you sure you want to create a semdom translation project into " + project.language;
	    modal.showModalSimple('Create Project', deletemsg, 'Cancel', 'Create Project').then(function() {

			semdomSetupApi.createProject(0, project.id, 1, function(result) {
				if (result.ok && result.success) {
		 	 		$state.go("edit", {'source' : 0, 'target': project.id});
			 	}
			});
	    });
	};
	
	$scope.clickJoin =  function(project) {
		
	    var deletemsg = "Do you want to submit a request to join semdom translation project into " + project.language;
	    modal.showModalSimple('Join Project', deletemsg, 'Cancel', 'Submit Join Request').then(function() {

			semdomSetupApi.createProject(0, project.id, 1, function(result) {
				if (result.ok && result.success) {
		 	 		$state.go("edit", {'source' : 0, 'target': project.id});
			 	}
			});
	    });
	};
	
}]);
