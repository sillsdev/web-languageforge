'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions'])
// DBE controller
.controller('editCtrl', ['$scope', '$stateParams', 'semdomtransEditService',  'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter',
function($scope, $stateParams, semdomEditApi, sessionService, modal, notice, $rootScope) {
	// refresh the data and go to state
    if ($scope.items.length == 0 && !$scope.loadingDto) {
    	$scope.refreshData(true);
    } 
	$scope.$parent.itemIndex = $stateParams.position;
	$scope.selectedTab = 0;
	 $scope.control = $scope;
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
					$scope.currentEntry = $scope.items[i];
					break;
				}
			}			
    }
	
	$scope.updateItem = function updateItem(v) {
		v = (v === undefined) ? 13 : v;
		if (v == 13) {
			api.updateTerm($scope.currentEntry, function(result) {
				;
			});
		}
	}
	
	$scope.refreshData = function refreshData(state) {
        $scope.$parent.refreshData(state, function() { });
    };
	
	// permissions stuff
	  $scope.rights = {
	    canEditProject: function canEditProject() {
	      return sessionService.hasProjectRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
	    },
	    canEditEntry: function canEditEntry() {
	      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.EDIT);
	    },
	    canDeleteEntry: function canDeleteEntry() {
	      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.DELETE);
	    },
	    canComment: function canComment() {
	      return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE);
	    },
	    canDeleteComment: function canDeleteComment(commentAuthorId) {
	      if (sessionService.session.userId == commentAuthorId) {
	        return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE_OWN);
	      } else {
	        return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE);
	      }
	    },
	    canEditComment: function canEditComment(commentAuthorId) {
	      if (sessionService.session.userId == commentAuthorId) {
	        return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT_OWN);
	      } else {
	        return false;
	      }
	    },
	    canUpdateCommentStatus: function canUpdateCommentStatus() {
	      return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT);
	    }
	  };
}]);
