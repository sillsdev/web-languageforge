'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice) {
	$scope.$parent.itemIndex = $stateParams.position;
	$scope.selectedTab = 0;
	
	$scope.currentQuestionPos = 0;
	$scope.tabDisplay = {"val": '0'};
	$scope.domainsFiltered = [];
	$scope.state = "edit";
	var api = semdomEditApi;
	
	$scope.setTab = function(val) {
		$scope.selectedTab = val;
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
	
	$scope.updateItem = function updateItem(v) {
		v = (v === undefined) ? 13 : v;
		if (v == 13) {
			api.updateTerm($scope.currentItem, function(result) {
				;
			});
		}
	}
}]);
