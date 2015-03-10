"use strict";
angular.module('palaso.ui.dc.comment', ['palaso.ui.utils', 'bellows.services'])
// Palaso UI Dictionary Control: Comments
.directive('dcComment', [function() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/bellows/directive/dc-comment.html',
    scope: {
      model : "=",
      control: "="
    },
    controller: ['$scope', 'lexCommentService', 'lexConfigService', 'sessionService', 'modalService', function($scope, commentService, configService, sessionService, modal) {

            $scope.hover = { comment: false };

            $scope.showNewReplyForm = false;

            $scope.newReply = {id:'', editingContent:''};

            $scope.editingCommentContent = '';
            
            
            if ($scope.model.regarding.field) {
              $scope.commentRegardingFieldConfig = configService.getFieldConfig($scope.model.regarding.field);
              $scope.isCommentRegardingPicture = (($scope.commentRegardingFieldConfig.type == 'pictures') && 
                  ! ($scope.model.regarding.inputSystem));
            }

            
            // I don't necessarily like this, but we keep the comment methods on edit.js so
            // that the view can be refreshed after an update or delete - cjh 2014-08

            $scope.doReply = function doReply() {
                hideInputFields();
                $scope.showNewReplyForm = true;
            };

            $scope.editReply = function editReply(reply) {
                hideInputFields();
                reply.editing = true;
                reply.editingContent = angular.copy(reply.content);
            };

            $scope.submitReply = function submitReply(reply) {
                hideInputFields();
                reply.content = angular.copy(reply.editingContent);
                delete reply.editingContent;
                updateReply($scope.model.id, reply);
                $scope.newReply = {id:'', editingContent:''};
            };
            
            
           function updateReply(commentId, reply) {
              commentService.updateReply(commentId, reply, function(result) {
                  if (result.ok) {
                    $scope.control.refreshData(false, function() {
                      $scope.control.loadEntryComments();
                    });
                  }
                });
            };

        $scope.updateCommentStatus = function updateCommentStatus(commentId, status) {
          commentService.updateStatus(commentId, status, function(result) {
            if (result.ok) {
              $scope.control.refreshData(false, function() {
                $scope.control.loadEntryComments();
              });
            }
          });
        };
        
        $scope.deleteComment = function deleteComment(comment) {
          var deletemsg;
          if (sessionService.session.userId == comment.authorInfo.createdByUserRef.id) {
            deletemsg = "Are you sure you want to delete your own comment?";
          } else {
            deletemsg = "Are you sure you want to delete " + comment.authorInfo.createdByUserRef.name + "'s comment?";
          }

          modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment').then(function() {
            commentService.remove(comment.id, function(result) {
              if (result.ok) {
                $scope.control.refreshData(false, function() {
                  $scope.control.loadEntryComments();
                });
              }
            });
            $scope.$parent.removeCommentFromLists(comment.id);
          });
        };


        $scope.deleteCommentReply = function deleteCommentReply(commentId, reply) {
          var deletemsg;
          if (sessionService.session.userId == reply.authorInfo.createdByUserRef.id) {
            deletemsg = "Are you sure you want to delete your own comment reply?";
          } else {
            deletemsg = "Are you sure you want to delete " + reply.authorInfo.createdByUserRef.name + "'s comment reply?";
          }

          modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply').then(function() {
            commentService.deleteReply(commentId, reply.id, function(result) {
              if (result.ok) {
                $scope.control.refreshData(false, function() {
                 $scope.control.loadEntryComments();
                });
              }
            });
            removeCommentFromLists(commentId, reply.id);
          });
        };      

        $scope.editComment = function editComment() {
            hideInputFields();
            $scope.model.editing = true;
            $scope.editingCommentContent = angular.copy($scope.model.content);
        };

        $scope.updateComment = function updateComment() {
            hideInputFields();
            $scope.model.content = angular.copy($scope.editingCommentContent);
            var comment = $scope.control.getComment($scope.model);

            commentService.update(comment, function(result) {
              if (result.ok) {
                  $scope.control.refreshData(false, function() {
                      $scope.control.loadEntryComments();
                  });
              }
            });
            $scope.editingCommentContent = '';
        };
            
            function hideInputFields() {
                for (var i=0; i< $scope.model.replies.length; i++) {
                    $scope.model.replies[i].editing = false;
                }
                $scope.showNewReplyForm = false;
                $scope.model.editing = false;
            }
            
            

    }],
    link: function(scope, element, attrs, controller) {
    }
  };
}]);