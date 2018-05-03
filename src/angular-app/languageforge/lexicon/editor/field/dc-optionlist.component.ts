import * as angular from 'angular';

import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexMultiValue} from '../../shared/model/lex-multi-value.model';
import {LexConfigOptionList} from '../../shared/model/lexicon-config.model';
import {LexOptionListItem} from '../../shared/model/option-list.model';
import {FieldControl} from './field-control.model';

export class FieldOptionListController implements angular.IController {
  model: LexOptionListItem | LexMultiValue;
  config: LexConfigOptionList;
  control: FieldControl;
  items: LexOptionListItem[];
  fieldName: string;
  parentContextGuid: string;

  contextGuid: string;

  static $inject = ['$state'];
  constructor(protected $state: angular.ui.IStateService) { }

  $onInit(): void {
    this.contextGuid = this.parentContextGuid;
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

  getDisplayName(key: string): string {
    let displayName = key;
    if (this.items != null) {
      for (const item of this.items) {
        if (item.key === key) {
          displayName = item.value;
          break;
        }
      }
    }

    return displayName;
  }

}

export const FieldOptionListComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    items: '<',
    fieldName: '<',
    parentContextGuid: '<'
  },
  controller: FieldOptionListController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-optionlist.component.html'
};
