'use strict';

// module definition
angular.module('bellows.services.comments')
//Lexicon Comment Service
  .service('lexCommentService', ['jsonRpc', 'commentsOfflineCache', '$filter', function(jsonRpc, offlineCache, $filter) {
    var _this = this;

    this.comments = {
      items: {
        currentEntry: [],
        currentEntryFiltered: [],
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

    this.removeCommentFromLists = function removeCommentFromLists(commentId, replyId) {
      if (replyId) {
        // just delete the replyId but don't delete the entire comment
        _deleteCommentInList(commentId, replyId, _this.comments.items.all);
        _deleteCommentInList(commentId, replyId, _this.comments.items.currentEntry);
        _deleteCommentInList(commentId, replyId, _this.comments.items.currentEntryFiltered);

      } else {
        // delete the entire comment
        offlineCache.deleteComment(commentId).then(function() {
          _deleteCommentInList(commentId, null, _this.comments.items.all);
          _deleteCommentInList(commentId, null, _this.comments.items.currentEntry);
          _deleteCommentInList(commentId, null, _this.comments.items.currentEntryFiltered);
        });
      }
    };

    this.refreshFilteredComments = function refreshFilteredComments(filter) {
      _this.comments.items.currentEntryFiltered.length = 0;
      var comments = $filter('filter')(_this.comments.items.currentEntry, filter.byText);
      var arr = _this.comments.items.currentEntryFiltered;
      arr.push.apply(arr, $filter('filter')(comments, filter.byStatus));
    };

    function _deleteCommentInList(commentId, replyId, list) {
      var deleteComment = true;
      if (replyId) {
        deleteComment = false;
      }
      for (var i = list.length - 1; i >= 0; i--) {
        var c = list[i];
        if (deleteComment) {
          if (c.id == commentId) {
            list.splice(i, 1);
          }
        } else {

          // delete Reply
          for (var j = c.replies.length - 1; j >= 0; j--) {
            var r = c.replies[j];
            if (r.id == replyId) {
              c.replies.splice(j, 1);
            }
          }
        }
      }
    }


    function getCurrentEntryComment(id) {
      var comments = _this.comments.items.currentEntry;
      for (var i=0; i<comments.length; i++) {
        var comment = comments[i];
        if (comment.id == id) {
          return comment;
        }
      }
    }

    jsonRpc.connect('/api/sf');



    this.update = function updateComment(comment, callback) {
      this.comments.items.currentEntry.push(comment);
      jsonRpc.call('lex_comment_update', [comment], callback);
    };

    this.updateReply = function updateReply(commentId, reply, callback) {
      var comment = getCurrentEntryComment(commentId);
      comment.replies.push(reply);
      jsonRpc.call('lex_commentReply_update', [commentId, reply], callback);
    };

    this.remove = function deleteComment(commentId, callback) {
      jsonRpc.call('lex_comment_delete', [commentId], callback);
    };

    this.deleteReply = function deleteReply(commentId, replyId, callback) {
      jsonRpc.call('lex_commentReply_delete', [commentId, replyId], callback);
    };

    this.plusOne = function plusOne(commentId, callback) {
      var comment = getCurrentEntryComment(commentId);
      comment.score++;
      this.comments.counts.userPlusOne[commentId] = 1;
      jsonRpc.call('lex_comment_plusOne', [commentId], callback);
    };

    this.updateStatus = function updateStatus(commentId, status, callback) {
      var comment = getCurrentEntryComment(commentId);
      comment.status = status;
      jsonRpc.call('lex_comment_updateStatus', [commentId, status], callback);
    };

  }])