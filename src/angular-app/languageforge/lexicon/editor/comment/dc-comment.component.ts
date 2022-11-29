import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {UtilityService} from '../../../../bellows/core/utility.service';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexiconEditorDataService} from '../../core/lexicon-editor-data.service';
import {LexComment, LexCommentChange, LexCommentReply} from '../../shared/model/lex-comment.model';
import {LexConfigField} from '../../shared/model/lexicon-config.model';
import {FieldControl} from '../field/field-control.model';

class Reply extends LexCommentReply {
  editingContent: string = '';
  id: string = ''; // inherited but initialized here
  isHover?: boolean;
  isAutoFocusEditing?: boolean;
  isEditing?: boolean;
}

export class CommentController implements angular.IController {
  comment: LexCommentChange;
  control: FieldControl;
  canPlusOneComment: (params: { commentId: string }) => boolean;
  loadComments: () => void;
  parentGetSenseLabel: (params: { regardingField: string, contextGuid: string }) => string;
  plusOneComment: (params: { commentId: string }) => void;
  setCommentInteractiveStatus: (params: { id: string, visible: boolean }) => void;

  getAvatarUrl = UtilityService.getAvatarUrl;
  showNewReplyForm = true;
  newReply: Reply = new Reply();
  editingCommentContent = '';
  isPosting = false;
  isAutoFocusNewReply: boolean = false;
  commentRegardingFieldConfig: LexConfigField;
  isCommentRegardingPicture: boolean;

  static $inject = ['sessionService', 'modalService',
    'lexCommentService', 'lexConfigService',
    'lexEditorDataService'
  ];
  constructor(private sessionService: SessionService, private modal: ModalService,
              private commentService: LexiconCommentService, private configService: LexiconConfigService,
              private editorService: LexiconEditorDataService) { }

  $onInit(): void {
    if (this.comment.regarding.field) {
      this.configService.getFieldConfig(this.comment.regarding.field).then((config: LexConfigField) => {
        this.commentRegardingFieldConfig = config;
        this.isCommentRegardingPicture =
          ((this.commentRegardingFieldConfig.type === 'pictures') && !(this.comment.regarding.inputSystem));
      });
    }
  }

  showCommentReplies(): void {
    this.comment.showRepliesContainer = !this.comment.showRepliesContainer;
    this.setCommentInteractiveStatus({ id: this.comment.id, visible: this.comment.showRepliesContainer });
    this.getSenseLabel();
  }

  canLike(): boolean {
    return this.canPlusOneComment({ commentId: this.comment.id }) && this.control.rights.canComment() &&
      this.comment.status !== 'resolved';
  }

  doReply(): void {
    this.hideInputFields();
    this.showNewReplyForm = true;
    this.isAutoFocusNewReply = true;
  }

  editReply(reply: Reply): void {
    this.hideInputFields();
    reply.isEditing = true;
    reply.editingContent = angular.copy(reply.content);
    reply.isAutoFocusEditing = true;
    this.showNewReplyForm = false;
  }

  cancelReply(reply: Reply): void {
    reply.isEditing = false;
    this.showNewReplyForm = true;
  }

  submitReply(reply: Reply, $event?: KeyboardEvent): void {
    if ($event != null) {
      if ($event.keyCode === 13) {
        // If there is no reply yet then cancel out
        if (!reply.editingContent) {
          $event.preventDefault();
          return;
        }
      } else {
        return;
      }
    }

    this.hideInputFields();
    this.isPosting = true;
    reply.content = angular.copy(reply.editingContent);
    delete reply.editingContent;
    this.updateReply(this.comment.id, reply);
    this.newReply = new Reply();
  }

  updateCommentStatus(commentId: string, status: string): void {
    this.commentService.updateStatus(commentId, status).then(result => {
      if (result.ok) {
        this.editorService.refreshEditorData().then(this.loadComments);
      }
    }).finally(() => {
      this.isPosting = false;
    });
  }

  deleteComment(comment: LexComment): void {
    let deletemsg;
    this.sessionService.getSession().then(session => {
      if (session.userId() === comment.authorInfo.createdByUserRef.id) {
        deletemsg = 'Are you sure you want to delete your own comment?';
      } else {
        deletemsg = 'Are you sure you want to delete ' +
          comment.authorInfo.createdByUserRef.name + '\'s comment?';
      }

      this.modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment') .then(() => {
        this.commentService.remove(comment.id).then(() => {
          this.editorService.refreshEditorData().then(this.loadComments);
        });

        this.commentService.removeCommentFromLists(comment.id);
      }, () => {});
    });
  }

  deleteCommentReply(commentId: string, reply: LexCommentReply): void {
    let deletemsg;
    this.sessionService.getSession().then(session => {
      if (session.userId() === reply.authorInfo.createdByUserRef.id) {
        deletemsg = 'Are you sure you want to delete your own comment reply?';
      } else {
        deletemsg = 'Are you sure you want to delete ' +
          reply.authorInfo.createdByUserRef.name + '\'s comment reply?';
      }

      this.modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply').then(() => {
        this.commentService.deleteReply(commentId, reply.id).then(() => {
          this.editorService.refreshEditorData().then(this.loadComments);
        });

        this.commentService.removeCommentFromLists(commentId, reply.id);
      }, () => {});
    });
  }

  editComment(): void {
    this.hideInputFields();
    this.comment.isEditing = true;
    this.editingCommentContent = angular.copy(this.comment.content);
  }

  updateComment(): void {
    this.hideInputFields();
    this.comment.content = angular.copy(this.editingCommentContent);
    this.editingCommentContent = '';
    this.commentService.update(this.comment).then(() => {
      this.editorService.refreshEditorData().then(this.loadComments);
    });
  }

  getSenseLabel(): string {
    return this.parentGetSenseLabel(
      { regardingField: this.comment.regarding.field, contextGuid: this.comment.contextGuid });
  }

  isOriginalRelevant(): boolean {
    if (this.comment.regarding.fieldValue) {
      if (this.getCurrentContextValue() !== this.comment.regarding.fieldValue) {
        return true;
      }
    }

    return false;
  }

  getCurrentContextValue(): string {
    const contextParts = this.control.getContextParts(this.comment.contextGuid);
    if (contextParts.option.key !== '' && (contextParts.fieldConfig.type === 'multioptionlist' ||
        (contextParts.fieldConfig.type === 'optionlist' && this.control.commentContext.contextGuid === ''))
    ) {
      return contextParts.option.label;
    } else if (contextParts.fieldConfig.type === 'pictures' && !contextParts.inputSystem &&
      this.control.commentContext.contextGuid === ''
    ) {
      return 'Something different just to force it to display';
    } else {
      return contextParts.value;
    }
  }

  getCommentRegardingPictureSource(): string {
    if (!this.isCommentRegardingPicture) {
      return '';
    }

    const contextParts = this.control.getContextParts(this.comment.contextGuid);
    let imageSrc = '';
    let pictures = null;
    if (contextParts.sense.guid) {
      pictures = this.control.currentEntry.senses[contextParts.sense.index].pictures;
    }

    for (const i in pictures) {
      if (pictures.hasOwnProperty(i) && pictures[i].guid === contextParts.value) {
        imageSrc = pictures[i].fileName;
      }
    }

    if (imageSrc) {
      imageSrc = '/assets/lexicon/' + this.control.project.slug + '/pictures/' + imageSrc;
    }

    return imageSrc;
  }

  private updateReply(commentId: string, reply: LexCommentReply): void {
    this.commentService.updateReply(commentId, reply).then(result => {
      if (result.ok) {
        this.editorService.refreshEditorData().then(this.loadComments);
        this.showNewReplyForm = true;
      }
    }).finally(() => {
      this.isPosting = false;
    });
  }

  private hideInputFields(): void {
    for (const reply of this.comment.replies) {
      (reply as Reply).isEditing = false;
    }

    this.comment.isEditing = false;
  }

}

export const CommentComponent: angular.IComponentOptions = {
  bindings: {
    comment: '<',
    control: '<',
    canPlusOneComment: '&',
    loadComments: '&',
    parentGetSenseLabel: '&',
    plusOneComment: '&',
    setCommentInteractiveStatus: '&'
  },
  controller: CommentController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/dc-comment.component.html'
};
