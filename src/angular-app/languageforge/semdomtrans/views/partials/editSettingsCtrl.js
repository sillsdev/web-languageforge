'use strict';

angular.module('semdomtrans.editSettings', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editSettingsCtrl', ['$scope', 'sessionService', 'modalService', 'silNoticeService',
function($scope, sessionService, modal, notice) {	
	$scope.tabDisplay = $scope.$parent.tabDisplay;
	$scope.domainsFiltered = $scope.$parent.domainsFiltered;
	$scope.updateDisplay = function(domainKey) {
		var display = false;
		
		for (var i = 0; i < $scope.$parent.terms.length; i++) {
			var key = $scope.$parent.terms[i].key;
			if (key == domainKey) {
				display = $scope.$parent.terms[i].display;
				break;
			}
		}
	
		
		for (var i = 0; i < $scope.$parent.terms.length; i++) {
			var key = $scope.$parent.terms[i].key;
			if (key != domainKey && key.substring(0, domainKey.length) == domainKey) {
				$scope.$parent.terms[i].display = display;
			}
		}
	}
	
	$scope.drillDown = function(domainKey) {
		var newDomainFiltered = []
		for (var i = 0; i < $scope.$parent.terms.length; i++) {
			var key = $scope.$parent.terms[i].key;
			if (key.substring(0, domainKey.length) == domainKey && key.length == domainKey.length + 2 ) {
				newDomainFiltered.push($scope.$parent.terms[i])
			}
		}
		
		
		if (newDomainFiltered.length > 0) {
			$scope.domainsFiltered = newDomainFiltered;
		}
	}
	
	$scope.drillUp = function() {
		var term = $scope.domainsFiltered[0];
		var termKey = term.key.substring(0, term.key.length - 2);
		$scope.domainsFiltered = [];
		for (var i = 0; i < $scope.$parent.terms.length; i++) {
			var key = $scope.$parent.terms[i].key;
			if (termKey.substring(0, termKey.length - 1) == key.substring(0, key.length - 1)) {
				$scope.domainsFiltered.push($scope.$parent.terms[i])
			}
		}
	}
	
}]);
