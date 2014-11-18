'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', 'semdomtransService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, semdomApi, sessionService, modal, notice) {
	$scope.terms = [];
	$scope.questions = [];
	$scope.showingTerms = true;
	semdomApi.editorDto(function(result) {
		if (result.ok) {
			$scope.terms = result.data.terms;
			$scope.currentTerm = $scope.terms[0];
			$scope.allQuestions = result.data.questions;
			for (var i = 0; i < $scope.allQuestions.length; i++) {
				var question = $scope.allQuestions[i];
			    if (question.key == $scope.currentTerm.key) {
			    	$scope.termQuestions = question.termQuestions;
			    	$scope.currentQuestion = question.currentQuestion;
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
	
	$scope.changeTerm = function(key) {
			for (var i = 0; i < $scope.terms.length; i++) {
				var term = $scope.terms[i];
			    if (term["key"] == key) {
			    	$scope.currentTerm = term;
			    	break;
			    }
			}
			
			for (var i = 0; i < $scope.allQuestions.length; i++) {
				var question = $scope.allQuestions[i];
			    if (question.key == $scope.currentTerm.key) {
			    	$scope.termQuestions = question.termQuestions;
			    	$scope.currentQuestion = question.currentQuestion;
			    	break;
			    }
			}
    }
	
}]);
