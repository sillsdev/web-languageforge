import * as angular from 'angular';

import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexMultiText} from '../../shared/model/lex-multi-text.model';
import {LexPicture} from '../../shared/model/lex-picture.model';
import {LexConfigInputSystems, LexConfigMultiText} from '../../shared/model/lexicon-config.model';
import {FieldControl} from './field-control.model';

export class FieldMultiTextController implements angular.IController {
  model: LexMultiText;
  config: LexConfigMultiText;
  control: FieldControl;
  fieldName: string;
  parentContextGuid: string;
  picture: LexPicture;
  selectField: (params: { inputSystem: string }) => void;

  isAudio = LexiconUtilityService.isAudio;
  contextGuid: string;
  inputSystems: LexConfigInputSystems;

  static $inject = ['$state'];
  constructor(private $state: angular.ui.IStateService) { }

  $onInit(): void {
    this.inputSystems = this.control.config.inputSystems;
    this.contextGuid = this.parentContextGuid;
    if (this.picture != null) {
      this.contextGuid += ' pictures#' + this.picture.guid;
    }
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

  selectInputSystem(tag: string): void {
    if (this.selectField == null) {
      return;
    }

    this.selectField({
      inputSystem: tag
    });
  }

  modelContainsSpan(tag: string): boolean {
    if (this.model == null || !(tag in this.model)) {
      return false;
    }

    const str = this.model[tag].value;
    return (new DOMParser().parseFromString(str, 'text/html').body.children.length) > 0;
  }

}

export const FieldMultiTextComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    fieldName: '<',
    parentContextGuid: '<',
    picture: '<?',
    selectField: '&?'
  },
  controller: FieldMultiTextController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multitext.component.html'
};
