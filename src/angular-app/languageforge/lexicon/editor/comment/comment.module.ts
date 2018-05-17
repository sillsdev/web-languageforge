import * as angular from 'angular';

import {CommentBubbleComponent} from './comment-bubble.component';
import {CommentsRightPanelComponent} from './comments-right-panel.component';
import {CurrentEntryCommentCountComponent} from './current-entry-comment-count.component';
import {CommentComponent} from './dc-comment.component';
import {LexCommentsViewComponent} from './lex-comments-view.component';
import {RegardingFieldComponent} from './regarding-field.component';

export const EditorCommentsModule = angular
  .module('lexCommentsModule', [])
  .directive('commentBubble', CommentBubbleComponent)
  .directive('commentsRightPanel', CommentsRightPanelComponent)
  .directive('currentEntryCommentCount', CurrentEntryCommentCountComponent)
  .directive('dcComment', CommentComponent)
  .directive('lexCommentsView', LexCommentsViewComponent)
  .directive('regardingField', RegardingFieldComponent)
  .name;
