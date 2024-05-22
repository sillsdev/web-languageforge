import * as angular from 'angular';

import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexCommentChange} from '../../shared/model/lex-comment.model';
import {LexEntry} from '../../shared/model/lex-entry.model';
import {LexField} from '../../shared/model/lex-field.model';
import {LexMultiText} from '../../shared/model/lex-multi-text.model';
import {LexMultiValue} from '../../shared/model/lex-multi-value.model';
import {LexValue} from '../../shared/model/lex-value.model';
import {FieldControl} from '../field/field-control.model';

export class LexCommentsViewController implements angular.IController {
  newComment: LexCommentChange;
  entry: LexEntry;
  control: FieldControl;

  static $inject = ['lexConfigService'];
  constructor(private lexConfig: LexiconConfigService) { }

  $onInit(): void {
    if (this.newComment == null) {
      this.newComment = new LexCommentChange();
    }

    this.control.getNewComment = this.getNewComment;
    this.control.selectFieldForComment = this.selectFieldForComment;
  }

  getNewComment = () => {
    return this.newComment;
  }

  selectFieldForComment = (fieldName: string, model: LexField, inputSystemTag: string,
                           multioptionValue: string, pictureFilePath: string, contextGuid: string): void => {
    if (!this.control.rights.canComment() || model == null) {
      return;
    }

    this.lexConfig.getFieldConfig(fieldName).then(fieldConfig => {
      this.newComment.regardingFieldConfig = fieldConfig;
      this.newComment.regarding.field = fieldName;
      this.newComment.regarding.fieldNameForDisplay = this.newComment.regardingFieldConfig.label;
      delete this.newComment.regarding.inputSystem;
      delete this.newComment.regarding.inputSystemAbbreviation;
      this.newComment.isRegardingPicture = false;
      this.newComment.contextGuid = contextGuid;
      if (inputSystemTag) {
        this.newComment.regarding.fieldValue = LexCommentsViewController.getFieldValue(model, inputSystemTag);
        this.newComment.regarding.inputSystem = this.control.config.inputSystems[inputSystemTag].languageName;
        this.newComment.regarding.inputSystemAbbreviation =
          this.control.config.inputSystems[inputSystemTag].abbreviation;
      } else if (multioptionValue) {
        this.newComment.regarding.fieldValue = multioptionValue;
      } else if (pictureFilePath) {
        this.newComment.regarding.fieldValue = pictureFilePath;
        this.newComment.isRegardingPicture = true;
      } else {
        this.newComment.regarding.fieldValue = LexCommentsViewController.getFieldValue(model);
      }
    });
  }

  private static getFieldValue(model: LexField, inputSystemTag?: string): string {
    // get value of option list
    if ((model as LexValue).value != null) {
      // todo return display value
      return (model as LexValue).value;
    }

    // get value of multi-option list
    if ((model as LexMultiValue).values != null) {
      // todo return display values
      return (model as LexMultiValue).values.join(' ');
    }

    // get value of multi-text with specified inputSystemTag
    if (inputSystemTag != null && (model as LexMultiText)[inputSystemTag] != null) {
      return (model as LexMultiText)[inputSystemTag].value;
    }

    // get first inputSystemTag of a multi-text (no inputSystemTag specified)
    let fieldValue: string = null;
    for (const languageTag in model as LexMultiText) {
      if (fieldValue == null) {
        fieldValue = (model as LexMultiText)[languageTag].value;
        break;
      }
    }

    return fieldValue;
  }

}

export const LexCommentsViewComponent: angular.IComponentOptions = {
  bindings: {
    newComment: '=?',
    entry: '<',
    control: '<'
  },
  controller: LexCommentsViewController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/lex-comments-view.component.html'
};
