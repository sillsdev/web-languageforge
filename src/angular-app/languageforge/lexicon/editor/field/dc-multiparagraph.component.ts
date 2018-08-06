import * as angular from 'angular';

import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexMultiParagraph} from '../../shared/model/lex-multi-paragraph.model';
import {LexConfigInputSystems, LexConfigMultiParagraph} from '../../shared/model/lexicon-config.model';
import {FieldControl} from './field-control.model';

export class FieldMultiParagraphController implements angular.IController {
  model: LexMultiParagraph;
  config: LexConfigMultiParagraph;
  control: FieldControl;
  fieldName: string;
  parentContextGuid: string;

  contextGuid: string;
  inputSystems: LexConfigInputSystems;

  static $inject = ['$state'];
  constructor(private $state: angular.ui.IStateService) { }

  $onInit(): void {
    this.inputSystems = this.control.config.inputSystems;
    this.contextGuid = this.parentContextGuid;
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

  inputSystemDirection(tag: string): string {
    if (this.inputSystems == null || !(tag in this.inputSystems)) {
      return 'ltr';
    }

    return (this.inputSystems[tag].isRightToLeft) ? 'rtl' : 'ltr';
  }

  modelContainsSpan(tag: string): boolean {
    if (this.model == null || !(tag in this.model)) {
      return false;
    }

    return this.model.paragraphsHtml.includes('</span>');
  }

}

export const FieldMultiParagraphComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    fieldName: '<',
    parentContextGuid: '<'
  },
  controller: FieldMultiParagraphController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multiparagraph.component.html'
};
