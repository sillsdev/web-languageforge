'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', 'semdomtransService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, semdomApi, sessionService, modal, notice) {
	$scope.terms = [];
	semdomApi.editorDto(function(result) {
		if (result.ok) {
			$scope.terms = result.data;
		}
	});
	$scope.currentTerm = $scope.terms[0]; 
	$scope.currentQuestion = {
		   "source": "What are some words associated with this planet?",
     	   "translation": "",
    	   "comments": ""
    }
	$scope.setOfQuestions = [
	                           {
	                        	   "source": "What are some words associated with this planet?",
	                        	   "translation": "",
	                        	   "comments": ""
	                           },
	                           {
	                        	   "source": "What are some words associated with the world we live on?",
	                        	   "translation": "",
	                        	   "comments": ""
	                           }
  ]
	
	
 $scope.changeTerm = function(key) {
		for (var i = 0; i < $scope.terms.length; i++) {
			var term = $scope.terms[i];
		    if (term["key"] == key) {
		    	$scope.currentTerm = term;
		    }
		}
    }
	
}]);
