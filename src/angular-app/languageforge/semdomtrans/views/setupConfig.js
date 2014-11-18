'use strict';

angular.module('semdomtrans.setupConfig', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('setupConfigCtrl', ['$scope', '$location', 'semdomtransConfigService', 'sessionService', 'modalService', 'silNoticeService',
function($scope, $location, semdomConfigApi, sessionService, modal, notice) {
	semdomConfigApi.getConfigurationData(function(result) { 
		if(result.ok) {
			$scope.config = result.data;
		}
	});
	
	$scope.saveConfig = function(showTerms, showQuestions) {
		semdomConfigApi.saveConfigurationData(showTerms, showQuestions);
    	$location.path( "/edit" );
	};
}]);
