'use strict';

// module definition
angular.module('bellows.services')
//Lexicon Comment Service
  .service('lexCommentService', ['jsonRpc', function(jsonRpc) {

    this.comments = {
      items: {
        currentEntry: [],
        all: []
      },
      counts: {
        currentEntry: {
          total: 0,
          fields: {}
        },
        byEntry: {},
        userPlusOne: []
      }
    };


    /*
     * currentEntryCommentCounts has the following structure: { 'total': int total
     * count 'fields': { 'lexeme': int count of comments for lexeme field,
     * 'definition': int count of comments for definition field, } }
     */
    this.comments.counts.currentEntry = { total: 0, fields: {}};


    /**
     * This should be called whenever the entry context changes (to update the comments and comment counts)
     * @param allComments
     * @param currentEntryId
     */
    this.loadEntryComments = function loadEntryComments(entryId) {
      this.comments.counts.currentEntry.total = 0;
      this.comments.counts.currentEntry.fields = {};
      this.comments.items.currentEntry.length = 0;
      for (var i = 0; i < this.comments.items.all.length; i++) {
        var comment = this.comments.items.all[i];
        var fieldName = comment.regarding.field;
        if (comment.entryRef == entryId) {
          if (fieldName && angular.isUndefined(this.comments.counts.currentEntry.fields[fieldName])) {
            this.comments.counts.currentEntry.fields[fieldName] = 0;
          }
          this.comments.items.currentEntry.push(comment);

          // update the appropriate count for this field and update the total count
          if (comment.status != 'resolved') {
            if (fieldName) {
              this.comments.counts.currentEntry.fields[fieldName]++;
            }
            this.comments.counts.currentEntry.total++;
          }
        }
      }
    };


    /**
     * this should be called whenever new data is received
     */
    this.updateGlobalCommentCounts = function updateGlobalCommentCounts() {
      for (var i = 0; i < this.comments.items.all.length; i++) {
        var comment = this.comments.items.all[i];

        // add counts to global entry comment counts
        if (angular.isUndefined(this.comments.counts.byEntry[comment.entryRef])) {
          this.comments.counts.byEntry[comment.entryRef] = 0;
        }
        if (comment.status != 'resolved') {
          this.comments.counts.byEntry[comment.entryRef]++;
        }
      }
    };


    this.getFieldCommentCount = function getFieldCommentCount(fieldName) {
      if (angular.isDefined(this.comments.counts.currentEntry.fields[fieldName])) {
        return this.comments.counts.currentEntry.fields[fieldName];
      }
      return 0;
    };

    this.getEntryCommentCount = function getEntryCommentCount(entryId) {
      if (angular.isDefined(this.comments.counts.byEntry[entryId])) {
        return this.comments.counts.byEntry[entryId];
      }
      return 0;
    };






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