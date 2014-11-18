'use strict';

angular.module('semdomtrans.setupConfig', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('setupConfigCtrl', ['$scope', '$location', 'semdomtransEditService' ,'semdomtransConfigService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, $location, semdomEditApi, semdomConfigApi, sessionService, modal, notice) {
	
	semdomEditApi.editorDto(function(result) {
		if (result.ok) {
			$scope.terms = []
			for (var i = 0; i < result.data.terms.length; i++) {
				$scope.terms.push(
					{
						'key':  result.data.terms[i].key, 
						'name':  result.data.terms[i].name,
						'description': result.data.terms[i].description, 
						'nameTrans': result.data.terms[i].nameTrans, 
						'descriptionTrans': result.data.terms[i].descriptionTrans, 
						'comments': result.data.terms[i].comments, 
					'selected': false
					});
			}
		}
	});
	
	
	semdomConfigApi.getConfigurationData(function(result) { 
		if(result.ok) {
			$scope.config = result.data;
			$scope.config.terms = []
		}
	});
	
	$scope.saveConfig = function(showTerms, showQuestions, terms) {
		var selectedTerms = {}
		
		for (var i = 0; i < terms.length; i++) {
			if (terms[i].selected) {
				selectedTerms[terms[i].key] = terms[i];
			}
		}
		alert(selectedTerms.length);
		
		semdomConfigApi.saveConfigurationData(showTerms, showQuestions, selectedTerms);
    	$location.path( "/edit" );
	};
	
	$scope.selectSubdomain = function(subDomainKey) {
		var select = true;
		var i = 0;
		for (i = 0; i < $scope.terms.length; i++) {
			if ($scope.terms[i].key.substring(0, subDomainKey.length) == subDomainKey) {
				select = !$scope.terms[i].selected;
				break;
			}
		}
		for (var j = i; j < $scope.terms.length; j++) {
			if ($scope.terms[j].key.substring(0, subDomainKey.length) == subDomainKey) {
				$scope.terms[j].selected = select;
			}
			else {
				break;
			}	
		}
	}
}]);
