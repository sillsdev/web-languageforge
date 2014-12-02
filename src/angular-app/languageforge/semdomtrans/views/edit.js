'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice) {
	$scope.items = [];
	$scope.selectedTab = 0;
	$scope.tabDisplay = {"val": '0'};
	$scope.domainsFiltered = [];
	
	semdomEditApi.editorDto($stateParams.source, $stateParams.target, function(result) {
		if (result.ok) {
			$scope.items = result.data.items;
			for (var i = 0; i < $scope.items.length; i++) {
				if ($scope.items[i].key.length == 1) {
					$scope.domainsFiltered.push($scope.items[i]);
				}
			}
			
			$scope.currentItem = $scope.items[0];			
			
		}
	});
	
	
	$scope.setTab = function(val) {
		$scope.selectedTab = val;
	}
	
	$scope.getPreviousQuestion = function() {
		$scope.currentItem.questions.position--;
	}
	
	$scope.getNextQuestion = function() {
		$scope.currentItem.questions.position++;
	}		
	
	$scope.changeTerm = function(key) {
			for (var i = 0; i < $scope.items.length; i++) {
				if ($scope.items[i].key == key) {
					$scope.currentItem = $scope.items[i];
					break;
				}
			}			
    }
	
}]);
