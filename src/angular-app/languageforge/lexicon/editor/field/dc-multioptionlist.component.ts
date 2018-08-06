import * as angular from 'angular';

import {LexMultiValue} from '../../shared/model/lex-multi-value.model';
import {LexConfigMultiOptionList} from '../../shared/model/lexicon-config.model';
import {LexOptionListItem} from '../../shared/model/option-list.model';
import {FieldOptionListController} from './dc-optionlist.component';

export class FieldMultiOptionListController extends FieldOptionListController implements angular.IController {
  model: LexMultiValue;
  config: LexConfigMultiOptionList;
  selectField: (params: { inputSystem: string, multioptionValue: string }) => void;

  isAdding = false;
  newKey: string;

  showDeleteButton(valueToBeDeleted: string, value: string): boolean {
    if (this.items != null && this.isAtEditorEntry() && this.control.rights.canEditEntry()) {
      return valueToBeDeleted === value;
    }

    return false;
  }

  orderItemsByListOrder = (key: string): string | number => {
    if (this.items == null) {
      return -1;
    }

    return this.items.map(item => item.key).indexOf(key);
  }

  filterSelectedItems = (item: LexOptionListItem): boolean => {
    if (this.model == null) {
      return false;
    }

    return !this.model.values.includes(item.key);
  }

  showAddButton(): boolean {
    return this.control.rights.canEditEntry() && this.isAtEditorEntry() && !this.isAdding && this.model != null &&
      this.items != null && this.model.values.length < this.items.length;
  }

  addValue(): void {
    if (this.newKey != null && !this.model.values.includes(this.newKey)) {
      this.model.values.push(this.newKey);
    }

    this.newKey = null;
    this.isAdding = false;
  }

  deleteValue(key: string): void {
    const index = this.model.values.indexOf(key);
    this.model.values.splice(index, 1);
  }

  selectValue(key: string): void {
    if (this.selectField == null) {
      return;
    }

    this.selectField({
      inputSystem: '',
      multioptionValue: this.getDisplayName(key)
    });
  }

}

export const FieldMultiOptionListComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    items: '<',
    fieldName: '<',
    parentContextGuid: '<',
    selectField: '&?'
  },
  controller: FieldMultiOptionListController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-multioptionlist.component.html'
};
