'use strict';

angular.module('semdomtrans.editSettings', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editSettingsCtrl', ['$scope', 'sessionService', 'modalService', 'silNoticeService',
function($scope, sessionService, modal, notice) {	
	$scope.tabDisplayed = $scope.$parent.tabDisplay;
	$scope.domainsFiltered = $scope.$parent.domainsFiltered;
	$scope.breadCrumb = ["Root"]
	
	$scope.updateIncluded = function(domainKey) {
		var included = false;
		
		for (var i = 0; i < $scope.$parent.items.length; i++) {
			var key = $scope.$parent.items[i].key;
			if (key == domainKey) {
				included = $scope.$parent.items[i].included;
				break;
			}
		}
	
		
		for (var i = 0; i < $scope.$parent.items.length; i++) {
			var key = $scope.$parent.items[i].key;
			if (key != domainKey && key.substring(0, domainKey.length) == domainKey) {
				$scope.$parent.items[i].included = included;
			}
		}
	}
	
	$scope.drillDown = function(domainKey) {
		var newDomainFiltered = []
		for (var i = 0; i < $scope.$parent.items.length; i++) {
			var key = $scope.$parent.items[i].key;
			if (key.substring(0, domainKey.length) == domainKey && key.length == domainKey.length + 2 ) {
				newDomainFiltered.push($scope.$parent.items[i])
			}
		}
		if (newDomainFiltered.length > 0) {
			
			for (var i = 0; i < $scope.$parent.items.length; i++) {
				var key = $scope.$parent.items[i].key;
				if (key == domainKey ) {
					$scope.breadCrumb.push($scope.$parent.items[i].term.name);	
				}
			}
			
			$scope.domainsFiltered = newDomainFiltered;
		}
	}
	
	$scope.drillUp = function(ln) {
		var termKey = $scope.domainsFiltered[0].key;
		termKey = termKey.substring(0, ln * 2+1);
		var breadCp = []
		for (var i = 0; i <= ln; i++) {
			breadCp.push($scope.breadCrumb[i]);
		}
		
		$scope.breadCrumb = breadCp;
		
		$scope.domainsFiltered = [];
		for (var i = 0; i < $scope.$parent.items.length; i++) {
			var key = $scope.$parent.items[i].key;
			if (termKey.substring(0, termKey.length - 1) == key.substring(0, key.length - 1)) {
				$scope.domainsFiltered.push($scope.$parent.items[i])
			}
		}
	}
	
}]);
