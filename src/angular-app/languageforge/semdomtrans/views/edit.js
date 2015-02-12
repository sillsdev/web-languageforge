'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice) {
	$scope.items = [];
	$scope.selectedTab = 0;
	$scope.currentQuestionPos = 0;
	$scope.tabDisplay = {"val": '0'};
	$scope.domainsFiltered = [];
	
	semdomEditApi.editorDto(function(result) {
		if (result.ok) {
			$scope.items = result.data.items;
			$scope.currentItem = $scope.items[0];
		}
	});
	
	$scope.setTab = function(val) {
		$scope.selectedTab = val;
	}
	
	$scope.getPreviousQuestion = function() {
		$scope.currentQuestionPos--;
	}
	
	$scope.getNextQuestion = function() {
		$scope.currentQuestionPos++;
	}		
	
	$scope.changeTerm = function(key) {
			$scope.currentQuestionPos = 0;
			for (var i = 0; i < $scope.items.length; i++) {
				if ($scope.items[i].key == key) {
					$scope.currentItem = $scope.items[i];
					break;
				}
			}			
    }
	
}]);
