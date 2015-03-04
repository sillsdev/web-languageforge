'use strict';

angular.module('semdomtrans.comments', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.scroll', 'palaso.ui.dc.comment', 'palaso.ui.comments-right-panel'])
// DBE controller
.controller('commentsCtrl', ['$scope', '$stateParams', 'sessionService', 'modalService', 'silNoticeService', 
function($scope, $stateParams, sessionService, modal, notice) {
  $scope.$parent.itemIndex = $stateParams.position;
  $scope.control = $scope;
  $scope.currentEntryComments = [];
  $scope.newComment = {
    id: '',
    content: '',
    entryRef: '',
    regarding: {
      'field': '',
      'fieldValue': ''
    }
  }
   
   $scope.loadEntryComments = function loadEntryComments() {
       var comments = [];
      
       for (var i = 0; i < $scope.comments.length; i++) {
         var comment = $scope.comments[i];
         if (comment.entryRef == $scope.control.currentEntry.id) {          
           // add comment to the correct 'field' container
           comments.push(comment);
       }       
     }
     
     $scope.currentEntryComments = comments;
   }
   

  if ($scope.items.length == 0 && !$scope.loadingDto) {
    $scope.refreshData(true, function() {
       return $scope.loadEntryComments();
     });
    } else {
      $scope.loadEntryComments();
    }
  
  $scope.setSelectedField = function setSelectedField(fieldName, model) {
    $scope.newComment.regarding.field = fieldName;
    $scope.newComment.regarding.fieldNameForDisplay = fieldName;
    $scope.newComment.regarding.fieldValue = model.source + "#" + model.translation;  
  }
    
    $scope.getComment = function getComment(comment) {
      $scope.newComment.entryRef = $scope.$parent.currentEntry.id; 
      comment = $scope.newComment;
      
      // TODO - check if it is a new comment
      var isNewComment = true;
      if (isNewComment) { // reset newComment
            $scope.control.newComment = {
              id: '',
              content: '',
              regarding: {}
            }; // model for new comment content
      }
      return comment;
    }  
  
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
