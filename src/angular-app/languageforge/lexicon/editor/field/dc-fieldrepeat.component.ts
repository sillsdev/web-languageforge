import * as angular from 'angular';

import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexMultiValue} from '../../shared/model/lex-multi-value.model';
import {LexConfigField, LexConfigOptionLists} from '../../shared/model/lexicon-config.model';
import {LexOptionListItem} from '../../shared/model/option-list.model';
import {FieldControl} from './field-control.model';

export class FieldRepeatController implements angular.IController {
  model: LexOptionListItem | LexMultiValue;
  config: LexConfigField;
  control: FieldControl;
  parentContextGuid: string;

  contextGuid: string;
  optionlists: LexConfigOptionLists;

  fieldContainsData = LexiconConfigService.fieldContainsData;

  $onInit(): void {
    this.contextGuid = this.parentContextGuid;
  }

  $onChanges(changes: any): void {
    const controlChange = changes.control as angular.IChangesObject<FieldControl>;
    if (controlChange != null && controlChange.currentValue && controlChange.currentValue.config != null) {
      this.optionlists = this.control.config.optionlists;
    }
  }

}

export const FieldRepeatComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    parentContextGuid: '<'
  },
  controller: FieldRepeatController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-fieldrepeat.component.html'
};
