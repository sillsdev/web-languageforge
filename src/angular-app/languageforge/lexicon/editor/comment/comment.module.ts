import * as angular from 'angular';

import {LexiconCoreModule} from '../../core/lexicon-core.module';
import {CommentBubbleComponent} from './comment-bubble.component';
import {CommentsRightPanelComponent} from './comments-right-panel.component';
import {CurrentEntryCommentCountComponent} from './current-entry-comment-count.component';
import {CommentComponent} from './dc-comment.component';
import {LexCommentsViewComponent} from './lex-comments-view.component';
import {RegardingFieldComponent} from './regarding-field.component';

export const EditorCommentsModule = angular
  .module('lexCommentsModule', [
    LexiconCoreModule
  ])
  .component('commentBubble', CommentBubbleComponent)
  .component('commentsRightPanel', CommentsRightPanelComponent)
  .component('currentEntryCommentCount', CurrentEntryCommentCountComponent)
  .component('dcComment', CommentComponent)
  .component('lexCommentsView', LexCommentsViewComponent)
  .component('regardingField', RegardingFieldComponent)
  .name;
