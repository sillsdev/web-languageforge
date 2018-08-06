import * as angular from 'angular';

import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';

export class CurrentEntryCommentCountController implements angular.IController {
  count = this.commentService.comments.counts.currentEntry;

  static $inject = ['lexCommentService'];
  constructor(private commentService: LexiconCommentService) { }
}

export const CurrentEntryCommentCountComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: CurrentEntryCommentCountController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/current-entry-comment-count.component.html'
};
