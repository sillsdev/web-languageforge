'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice'])
// DBE controller
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, userService, sessionService, modal, notice) {
	$scope.terms = [
	                 {
	                   'key': '1.1',
	                   'source': 'Planet',
	                  'translation': 'Planeta',
	                  'comments': 'This translation may not be true in every context'
	                 },
	                 {
	                  'key': '1.2',
	                  'source': 'Earth',
	                  'translation': '',
	                  'comments': 'Please double check'
	                 },
	                 {
                	  'key': '1.3',
	                  'source': 'Moon',
	                  'translation': '',
	                  'comments': ''
	                 }
	                  
	               ];
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
