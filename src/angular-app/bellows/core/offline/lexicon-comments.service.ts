import * as angular from 'angular';

import {LexiconConfigService} from '../../../languageforge/lexicon/core/lexicon-config.service';
import {LexComment, LexCommentReply} from '../../../languageforge/lexicon/shared/model/lex-comment.model';
import {ApiService} from '../api/api.service';
import {JsonRpcCallback, JsonRpcResult} from '../api/json-rpc.service';
import {CommentsOfflineCacheService} from './comments-offline-cache.service';

class CommentItems {
  currentEntry: LexComment[] = [];
  currentEntryFiltered: LexComment[] = [];
  all: LexComment[] = [];
}

interface CountFields { [fieldName: string]: number; }
class CountCurrentEntry {
  total: number = 0;
  fields: CountFields = {};
}

class CommentCounts {
  currentEntry: CountCurrentEntry = new CountCurrentEntry();
  byEntry: { [entryId: string]: number; } = {};
  userPlusOne: { [commentId: string]: number; } = {};
}

export class Comments {
  items: CommentItems = new CommentItems();
  counts: CommentCounts = new CommentCounts();
}

export class LexiconCommentService {
  comments: Comments = new Comments();

  static $inject: string[] = ['$filter', 'apiService', 'commentsOfflineCache', 'lexConfigService'];
  constructor(private $filter: angular.IFilterService, private api: ApiService,
              private offlineCache: CommentsOfflineCacheService, private lexConfig: LexiconConfigService) { }

  /**
   * This should be called whenever the entry context changes (to update the comments and comment counts)
   */
  loadEntryComments(entryId: string): Promise<any> {
    this.comments.counts.currentEntry.total = 0;
    this.comments.counts.currentEntry.fields = {};
    this.comments.items.currentEntry.length = 0;
    const promises = [];
    for (const comment of this.comments.items.all) {
      if (comment.entryRef === entryId) {
        promises.push(this.lexConfig.getFieldConfig(comment.regarding.field).then(fieldConfig => {
          // As the promise runs when its ready the comments can double up if loadEntryComments is run multiple times
          if (this.comments.items.currentEntry.indexOf(comment) === -1) {
            let contextGuid = '';
            if (comment.contextGuid !== undefined && comment.contextGuid !== '') {
              contextGuid = comment.contextGuid;
            } else {
              contextGuid = comment.regarding.field +
                (comment.regarding.inputSystemAbbreviation ? '.' + comment.regarding.inputSystemAbbreviation : '');
              if (fieldConfig != null && fieldConfig.type === 'multioptionlist') {
                contextGuid += '#' + comment.regarding.fieldValue;
              }
              comment.contextGuid = contextGuid;
            }

            if (contextGuid && this.comments.counts.currentEntry.fields[contextGuid] == null) {
              this.comments.counts.currentEntry.fields[contextGuid] = 0;
            }

            this.comments.items.currentEntry.push(comment);

            // update the appropriate count for this field and update the total count
            if (comment.status !== 'resolved') {
              if (contextGuid) {
                this.comments.counts.currentEntry.fields[contextGuid]++;
              }

              this.comments.counts.currentEntry.total++;
            }
          }
        }));
      }
    }
    return Promise.all(promises);
  }

  /**
   * this should be called whenever new data is received
   */
  updateGlobalCommentCounts(): void {
    this.comments.counts.byEntry = {};
    for (const comment of this.comments.items.all) {
      // add counts to global entry comment counts
      if (this.comments.counts.byEntry[comment.entryRef] == null) {
        this.comments.counts.byEntry[comment.entryRef] = 0;
      }

      if (comment.status !== 'resolved') {
        this.comments.counts.byEntry[comment.entryRef]++;
      }
    }
  }

  getFieldCommentCount(contextGuid: string): number {
    if (this.comments == null || this.comments.counts.currentEntry.fields[contextGuid] == null) {
      return 0;
    }

    return this.comments.counts.currentEntry.fields[contextGuid];
  }

  getEntryCommentCount(entryId: string): number {
    if (this.comments.counts.byEntry[entryId] == null) {
      return 0;
    }

    return this.comments.counts.byEntry[entryId];
  }

  removeCommentFromLists = (commentId: string, replyId?: string): void => {
    if (replyId) {
      // just delete the replyId but don't delete the entire comment
      LexiconCommentService.deleteCommentInList(commentId, replyId, this.comments.items.all);
      LexiconCommentService.deleteCommentInList(commentId, replyId, this.comments.items.currentEntry);
      LexiconCommentService.deleteCommentInList(commentId, replyId, this.comments.items.currentEntryFiltered);
    } else {
      // delete the entire comment
      this.offlineCache.deleteComment(commentId).then(() => {
        if (this != null && this.comments != null) {
          LexiconCommentService.deleteCommentInList(commentId, null, this.comments.items.all);
          LexiconCommentService.deleteCommentInList(commentId, null, this.comments.items.currentEntry);
          LexiconCommentService.deleteCommentInList(commentId, null, this.comments.items.currentEntryFiltered);
        }
      });
    }
  }

  refreshFilteredComments(filter: any): void {
    this.comments.items.currentEntryFiltered.length = 0;
    let comments = this.$filter('filter')(this.comments.items.currentEntry, filter.byText);
    const arr = this.comments.items.currentEntryFiltered;
    comments = this.$filter('filter')(comments, filter.byStatus);
    comments = this.$filter('filter')(comments, filter.byContext);
    arr.push.apply(arr, comments);
  }

  update(commentData: any, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    return this.api.call('lex_comment_update', [commentData], callback);
  }

  updateReply(commentId: string, reply: LexCommentReply, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    const comment = this.getCurrentEntryComment(commentId);
    comment.replies.push(reply);
    return this.api.call('lex_commentReply_update', [commentId, reply], callback);
  }

  remove(commentId: string, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    return this.api.call('lex_comment_delete', [commentId], callback);
  }

  deleteReply(commentId: string, replyId: string, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    return this.api.call('lex_commentReply_delete', [commentId, replyId], callback);
  }

  plusOne(commentId: string, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    const comment = this.getCurrentEntryComment(commentId);
    comment.score++;
    this.comments.counts.userPlusOne[commentId] = 1;
    return this.api.call('lex_comment_plusOne', [commentId], callback);
  }

  updateStatus(commentId: string, status: string, callback?: JsonRpcCallback): angular.IPromise<JsonRpcResult> {
    const comment = this.getCurrentEntryComment(commentId);
    comment.status = status;
    return this.api.call('lex_comment_updateStatus', [commentId, status], callback);
  }

  private static deleteCommentInList(commentId: string, replyId: string, commentsList: LexComment[]): void {
    let deleteComment = true;
    if (replyId) {
      deleteComment = false;
    }

    for (let i = commentsList.length - 1; i >= 0; i--) {
      const comment = commentsList[i];
      if (deleteComment) {
        if (comment.id === commentId) {
          commentsList.splice(i, 1);
        }
      } else {
        // delete Reply
        for (let j = comment.replies.length - 1; j >= 0; j--) {
          const reply = comment.replies[j];
          if (reply.id === replyId) {
            comment.replies.splice(j, 1);
          }
        }
      }
    }
  }

  private getCurrentEntryComment(id: string): LexComment {
    const comments = this.comments.items.currentEntry;
    for (const comment of comments) {
      if (comment.id === id) {
        return comment;
      }
    }
  }

}
