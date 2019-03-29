import * as angular from 'angular';

import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {InputSystem} from '../../../../bellows/shared/model/input-system.model';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexEntry} from '../../shared/model/lex-entry.model';
import {LexField} from '../../shared/model/lex-field.model';
import {LexPicture} from '../../shared/model/lex-picture.model';
import {FieldControl} from '../field/field-control.model';

export class CommentBubbleController implements angular.IController {
  field: string;
  control: FieldControl;
  model: LexField;
  parentContextGuid: string;
  configType: string;
  inputSystem: InputSystem;
  multiOptionValue: string;
  picture: LexPicture;
  getPictureUrl: (picture: LexPicture) => string;

  active: boolean = false;
  pictureSrc: string = '';
  contextGuid: string;

  static $inject = ['$element', '$scope',
    'lexCommentService', 'lexConfigService'];
  constructor(private $element: angular.IRootElementService, private $scope: angular.IScope,
              private commentService: LexiconCommentService, private lexConfig: LexiconConfigService) { }

  $onInit(): void {
    if (this.inputSystem == null) {
      this.inputSystem = {
        abbreviation: '',
        tag: ''
      } as InputSystem;
    }

    this.setContextGuid();

    this.$scope.$watch(() => this.model, () => {
      this.checkValidModelContextChange();
    }, true);

    this.$scope.$watch(() => this.inputSystem, () => {
      this.setContextGuid();
    }, true);

  }

  getCountForDisplay(): number | string {
    const count = this.getCount();
    if (count) {
      return count;
    } else {
      return '';
    }
  }

  getComments(): void {
    if (!this.active) {
      return;
    }

    if (this.control.commentContext.contextGuid === this.contextGuid) {
      this.control.hideRightPanel();
    } else {
      this.control.setCommentContext(this.contextGuid);
      this.selectFieldForComment();
      let bubbleOffsetTop;
      if (this.multiOptionValue) {
        bubbleOffsetTop = this.$element.parents('.list-repeater').offset().top;
      } else {
        bubbleOffsetTop = this.$element.offset().top;
      }

      const rightPanel = document.querySelector('.comments-right-panel') as HTMLElement;
      const offsetAuthor = 40;
      rightPanel.style.paddingTop = (bubbleOffsetTop - rightPanel.getBoundingClientRect().top - offsetAuthor) + 'px';
      if (this.control.rightPanelVisible === false ||
        !document.querySelector('#lexAppCommentView').classList.contains('panel-visible')
      ) {
        this.control.showCommentsPanel();
      }
    }
  }

  isCommentingAvailable(): boolean {
    return !CommentBubbleController.isEntryNew(this.control.currentEntry) && this.control.rights.canComment() &&
      (this.field !== 'entry' || this.getCount() > 0);
  }

  private getCount(): number {
    if (this.control.rights.canComment()) {
      return this.commentService.getFieldCommentCount(this.contextGuid);
    }
  }

  private checkValidModelContextChange(): void {
    const newComment = this.control.getNewComment();
    if (this.configType === 'optionlist' && newComment.regarding != null &&
      newComment.regarding.field === this.field
    ) {
      this.selectFieldForComment();
    }
  }

  private selectFieldForComment(): void {
    this.control.selectFieldForComment(this.field,
      this.model,
      this.inputSystem.tag,
      this.multiOptionValue,
      this.pictureSrc,
      this.contextGuid);
  }

  private setContextGuid(): void {
    this.contextGuid = this.parentContextGuid + (this.parentContextGuid ? ' ' : '') + this.field;
    this.lexConfig.getFieldConfig(this.field).then(fieldConfig => {
      if (this.configType == null) {
        this.configType = fieldConfig.type;
      }

      if (fieldConfig.type === 'pictures' && this.picture != null) {
        this.pictureSrc = this.getPictureUrl(this.picture);
        this.contextGuid += '#' + this.picture.guid; // Would prefer to use the ID
      } else if (fieldConfig.type === 'multioptionlist') {
        this.contextGuid += '#' + this.multiOptionValue;
      }

      this.contextGuid += (this.inputSystem.tag ? '.' + this.inputSystem.tag : '');
      if (!this.contextGuid.includes('undefined')) {
        this.active = true;
      }
    });
  }

  private static isEntryNew(entry: LexEntry): boolean {
    return entry.id != null && entry.id.includes('_new_');
  }

}

export const CommentBubbleComponent: angular.IComponentOptions = {
  bindings: {
    field: '<',
    control: '<',
    model: '<',
    parentContextGuid: '<',
    configType: '<?',
    inputSystem: '<?',
    multiOptionValue: '<?',
    picture: '<?',
    getPictureUrl: '&?'
  },
  controller: CommentBubbleController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comment-bubble.component.html'
};
