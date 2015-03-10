'use strict';

// module definition
angular.module('bellows.services', ['jsonRpc'])
//Lexicon Comment Service
.service('lexCommentService', ['jsonRpc', function(jsonRpc) {
  jsonRpc.connect('/api/sf');

  this.update = function updateComment(comment, callback) {
    jsonRpc.call('lex_comment_update', [comment], callback);
  };

  this.updateReply = function updateReply(commentId, reply, callback) {
    jsonRpc.call('lex_commentReply_update', [commentId, reply], callback);
  };

  this.remove = function deleteComment(commentId, callback) {
    jsonRpc.call('lex_comment_delete', [commentId], callback);
  };

  this.deleteReply = function deleteReply(commentId, replyId, callback) {
    jsonRpc.call('lex_commentReply_delete', [commentId, replyId], callback);
  };

  this.plusOne = function plusOne(commentId, callback) {
    jsonRpc.call('lex_comment_plusOne', [commentId], callback);
  };

  this.updateStatus = function updateStatus(commentId, status, callback) {
    jsonRpc.call('lex_comment_updateStatus', [commentId, status], callback);
  };
}])