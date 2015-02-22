'use strict';

angular.module('semdomtrans.comments', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term'])
// DBE controller
.controller('commentsCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice) {
	var api = semdomEditApi;
	$scope.$parent.itemIndex = $stateParams.position;
	
	$scope.newComment = {
		id: '',
		content: '',
		regarding: {
			'semDomItemRef': '',
			'fieldName': '',
			'fieldValue': ''
		}
	}
	

	$scope.setSelectedField = function setSelectedField(fieldName, model) {
		$scope.newComment.regarding.fieldName = fieldName;
		$scope.newComment.regarding.fieldValue = model;	
	}
	
	$scope.createComment = function createComment() {
		$scope.newComment.regarding.semDomItemRef = $scope.currentItem.id;	
		semdomEditApi.updateComment($scope.newComment, function(result) {
			;
		});
	}
}]);
