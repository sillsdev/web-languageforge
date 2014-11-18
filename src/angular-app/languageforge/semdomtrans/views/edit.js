'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', 'semdomtransEditService',  'sessionService', 'semdomtransConfigService', 'modalService', 'silNoticeService',
function($scope, semdomEditApi, sessionService, semdomConfigApi, modal, notice) {
	$scope.terms = [];
	$scope.questions = [];
	$scope.showingTerms = true;
	
	semdomConfigApi.getConfigurationData(function(result) { 
			if(result.ok) {
				$scope.config = result.data;
				if (!$scope.config.showTerms) 
					$scope.showingTerms = false;
			}
		}
	);
	
	semdomEditApi.editorDto(function(result) {
		if (result.ok) {
			$scope.currentTerm = $scope.config.terms[0];
			$scope.allQuestions = result.data.questions;
			for (var i = 0; i < $scope.allQuestions.length; i++) {
				var question = $scope.allQuestions[i];
			    if (question.key == $scope.currentTerm.key) {
			    	$scope.currentTermQuestions = question;
			    	break;
			    }
			}
			
		}
	});
	
	
	$scope.showTerms = function() {
		$scope.showingTerms = true;
		return;
	}
	
	$scope.showQuestions = function() {
		$scope.showingTerms = false;
		return;
	}
	
	$scope.getPreviousQuestion = function() {
		$scope.currentTermQuestions.position--;
	}
	
	$scope.getNextQuestion = function() {
		$scope.currentTermQuestions.position++;
	}
	
	$scope.changeTerm = function(key) {
			for (var i = 0; i < $scope.config.terms.length; i++) {
				var term = $scope.config.terms[i];
			    if (term["key"] == key) {
			    	$scope.currentTerm = term;
			    	break;
			    }
			}
			
			for (var i = 0; i < $scope.allQuestions.length; i++) {
				var question = $scope.allQuestions[i];
			    if (question.key == $scope.currentTerm.key) {
			    	$scope.currentTermQuestions = question;
			    	break;
			    }
			}
    }
	
}]);
