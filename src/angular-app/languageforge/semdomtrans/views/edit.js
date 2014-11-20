'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, semdomEditApi, sessionService, modal, notice) {
	$scope.terms = [];
	$scope.questions = [];
	$scope.selectedTab = 0;
	$scope.showTerms = true;
	$scope.showQuestions = true;
	
	semdomEditApi.editorDto(function(result) {
		if (result.ok) {
			$scope.terms = result.data.terms;
			$scope.currentTerm = $scope.terms["1"]
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
		$scope.selectedTab = 0;
	}
	
	$scope.showQuestions = function() {
		$scope.selectedTab = 1;
	}
	
	$scope.getPreviousQuestion = function() {
		$scope.currentTermQuestions.position--;
	}
	
	$scope.getNextQuestion = function() {
		$scope.currentTermQuestions.position++;
	}
	
	$scope.getTermValues = function() {
		var terms = [];
		for (var key in $scope.terms) {
			terms.push($scope.terms[key]);
		}
		
		return terms;
	}
	
	$scope.changeTerm = function(key) {
			$scope.currentTerm = $scope.terms[key]
			
			for (var i = 0; i < $scope.allQuestions.length; i++) {
				var question = $scope.allQuestions[i];
			    if (question.key == $scope.currentTerm.key) {
			    	$scope.currentTermQuestions = question;
			    	break;
			    }
			}
    }
	
}]);
