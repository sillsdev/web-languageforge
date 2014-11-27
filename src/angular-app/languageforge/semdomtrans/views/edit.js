'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice) {
	$scope.terms = [];
	$scope.questions = [];
	$scope.selectedTab = 0;
	$scope.tabDisplay = {"val": '0'};
	$scope.domainsFiltered = [];
	
	semdomEditApi.editorDto($stateParams.source, $stateParams.target, function(result) {
		if (result.ok) {
			$scope.terms = result.data.terms;
			for (var i = 0; i < $scope.terms.length; i++) {
				if ($scope.terms[i].key.length == 1) {
					$scope.domainsFiltered.push($scope.terms[i]);
				}
			}
			
			$scope.currentTerm = $scope.terms[0];
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
	
	
	$scope.setTab = function(val) {
		$scope.selectedTab = val;
	}
	
	$scope.getPreviousQuestion = function() {
		$scope.currentTermQuestions.position--;
	}
	
	$scope.getNextQuestion = function() {
		$scope.currentTermQuestions.position++;
	}
		
	$scope.updateDisplay = function(domainKey) {
		var termChanged = $scope.terms[domainKey];
		var display = termChanged.display;
		
		for (var i = 0; i < $scope.terms.length; i++) {
			if ($scope.terms[i].key.substring(0, domainKey.length) == domainKey) {
				$scope.terms[i].display = false;
			}
		}
	}
	
	$scope.changeTerm = function(key) {
			for (var i = 0; i < $scope.terms.length; i++) {
				if ($scope.terms[i].key == key) {
					$scope.currentTerm = $scope.terms[i];
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
