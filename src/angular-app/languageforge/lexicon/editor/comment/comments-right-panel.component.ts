import * as angular from 'angular';

import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {LexiconEditorDataService} from '../../core/lexicon-editor-data.service';
import {LexComment, LexCommentFieldReference} from '../../shared/model/lex-comment.model';
import {LexCommentChange} from '../../shared/model/lex-comment.model';
import {LexEntry} from '../../shared/model/lex-entry.model';
import {LexConfigFieldList} from '../../shared/model/lexicon-config.model';
import {FieldControl} from '../field/field-control.model';

class CommentFilter {
  text: string = '';
  status: string = 'all';
  contextGuid: string = '';
  byText: (comment: LexComment) => boolean;
  byStatus: (comment: LexComment) => boolean;
  byContext: (comment: LexComment) => boolean;
}

export class CommentsRightPanelController implements angular.IController {
  newComment: LexCommentChange;
  entry: LexEntry;
  control: FieldControl;

  currentEntryCommentsFiltered = this.commentService.comments.items.currentEntryFiltered;
  showNewComment: boolean = false;
  senseLabel: string = '';
  isPosting: boolean = false;
  commentInteractiveStatus = {
    id: '',
    visible: false
  };
  commentFilter: CommentFilter;

  static $inject = ['$scope', 'lexCommentService',
    'lexEditorDataService'];
  constructor(private $scope: angular.IScope, private commentService: LexiconCommentService,
              private editorService: LexiconEditorDataService) { }

  $onInit(): void {
    this.commentFilter = {
      text: '',
      status: 'all',
      contextGuid: '',
      byText: (comment: LexComment): boolean => {
        if (this.commentFilter.text === '') {
          return true;
        }

        // Convert entire comment object to a big string and search for filter.
        // Note: This has a slight side effect of ID and avatar information
        // matching the filter.
        return JSON.stringify(comment).normalize().toLowerCase()
          .includes(this.commentFilter.text.normalize().toLowerCase());
      },

      byStatus: (comment: LexComment): boolean => {
        if (comment != null) {
          if (this.commentFilter.status === 'all') {
            return true;
          } else if (this.commentFilter.status === 'todo') {
            if (comment.status === 'todo') {
              return true;
            }
          } else if (this.commentFilter.status === 'resolved') {
            if (comment.status === 'resolved') {
              return true;
            }
          } else { // show unresolved comments
            if (comment.status !== 'resolved') {
              return true;
            }
          }
        }

        return false;
      },

      byContext: (comment: LexComment): boolean => {
        if (comment == null) {
          return false;
        } else if (!this.commentFilter.contextGuid) {
          // Return true as we're most likely not running a valid context search so return all
          return true;
        } else if (this.commentFilter.contextGuid) {
          // All new comments will have a context ID available
          return (comment.contextGuid === this.commentFilter.contextGuid);
        }

        return false;
      }
    };

    this.commentService.refreshFilteredComments(this.commentFilter);

    this.$scope.$watch(() => this.entry, (newVal: LexEntry) => {
      if (newVal && Object.keys(newVal).length !== 0) {
        this.loadComments();
        this.initializeNewComment();
      }
    });

    this.$scope.$watch(() => this.commentFilter.text, (newVal: string, oldVal: string) => {
      if (newVal !== oldVal) {
        this.commentService.refreshFilteredComments(this.commentFilter);
      }
    });

    this.$scope.$watch(() => this.commentFilter.status, (newVal: string, oldVal: string) => {
      if (newVal !== oldVal) {
        this.commentService.refreshFilteredComments(this.commentFilter);
      }
    });

    this.$scope.$watch(() => (this.control != null) ? this.control.commentContext : null,
      (newVal: LexComment, oldVal: LexComment) => {
        if (newVal != null && newVal !== oldVal) {
          this.showCommentsInContext(newVal.contextGuid);
        }
      }, true);
  }

  loadComments = (): void => {
    this.commentService.loadEntryComments(this.entry.id).then(() => {
      this.commentService.refreshFilteredComments(this.commentFilter);
      if (this.commentInteractiveStatus.id) {
        for (const comment of this.currentEntryCommentsFiltered) {
          if (comment.id === this.commentInteractiveStatus.id) {
            (comment as LexCommentChange).showRepliesContainer = this.commentInteractiveStatus.visible;
          }
        }
      }
    });
  }

  setCommentInteractiveStatus = (id: string, visible: boolean): void => {
    this.commentInteractiveStatus.id = id;
    this.commentInteractiveStatus.visible = visible;
  }

  plusOneComment = (commentId: string): void => {
    this.commentService.plusOne(commentId, result => {
      if (result.ok) {
        this.editorService.refreshEditorData().then(() => {
          this.loadComments();
        });
      }
    });
  }

  canPlusOneComment = (commentId: string): boolean => {
    return !(this.commentService.comments.counts.userPlusOne != null &&
      this.commentService.comments.counts.userPlusOne[commentId] != null);
  }

  getSenseLabel = (regardingField: string, contextGuid: string): string => {
    if (regardingField == null || this.control.config == null) {
      return '';
    }

    let index = null;
    if (contextGuid != null) {
      const contextParts = this.control.getContextParts(contextGuid);
      if (contextParts.example.index) {
        index = contextParts.example.index;
      } else if (contextParts.sense.index) {
        index = contextParts.sense.index;
      }
    }

    let configField = null;
    const entryConfig = this.control.config.entry;
    const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
    const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
    if (entryConfig.fields.hasOwnProperty(regardingField)) {
      configField = entryConfig.fields[regardingField];
    } else if (sensesConfig.fields.hasOwnProperty(regardingField)) {
      configField = sensesConfig.fields[regardingField];
    } else if (examplesConfig.fields.hasOwnProperty(regardingField)) {
      configField = examplesConfig.fields[regardingField];
    }

    if (configField !== null) {
      if (configField.hasOwnProperty('senseLabel')) {
        if (index != null) {
          return configField.senseLabel[index];
        }
      }
    }

    return '';
  }

  getNewCommentSenseLabel(regardingField: string): string {
    if (regardingField == null) {
      return '';
    }

    return this.getSenseLabel(regardingField, this.newComment.contextGuid);
  }

  getNewCommentPlaceholderText(): string {
    let label;
    if (this.currentEntryCommentsFiltered.length === 0) {
      label = 'Your comment goes here.  Be the first to share!';
    } else if (this.currentEntryCommentsFiltered.length > 0) {
      if (this.newComment != null && this.newComment.regarding != null) {
        label = 'Start a new conversation relating to the ' + this.newComment.regarding.fieldNameForDisplay;
      } else {
        label = 'Start a new conversation';
      }
    } else {
      label = 'Join the discussion and type your comment here.';
    }

    return label;
  }

  postNewComment(): void {
    // Get the latest value for the field before saving in case it has changed
    // since the comment panel was first triggered and comment started getting entered
    const contextParts = this.control.getContextParts(this.newComment.contextGuid);
    this.newComment.regarding.fieldValue = contextParts.value;
    this.isPosting = true;
    this.commentService.update(this.newComment, result => {
      if (result.ok) {
        this.editorService.refreshEditorData().then(() => {
          const previousComment = angular.copy(this.newComment);
          this.loadComments();
          this.initializeNewComment();
          this.newComment.regarding = previousComment.regarding;
        }).finally(() => {
          this.isPosting = false;
        });
      }
    });

    this.commentService.refreshFilteredComments(this.commentFilter); // for instant feedback
  }

  private initializeNewComment(): void {
    if (this.showNewComment && this.entry.id === this.newComment.entryRef) {
      if (this.isPosting) {
        this.newComment.content = '';
      }
    } else {
      this.newComment.id = '';
      this.newComment.content = '';
      this.newComment.entryRef = this.entry.id;
      this.newComment.regarding = new LexCommentFieldReference();
      this.newComment.contextGuid = '';
    }
  }

  private showCommentsInContext(contextGuid: string): void {
    this.commentFilter.contextGuid = contextGuid;
    this.showNewComment = (contextGuid !== '');
    this.commentService.refreshFilteredComments(this.commentFilter);
  }

}

export const CommentsRightPanelComponent: angular.IComponentOptions = {
  bindings: {
    newComment: '=',
    entry: '<',
    control: '<'
  },
  controller: CommentsRightPanelController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comments-right-panel.component.html'
};
