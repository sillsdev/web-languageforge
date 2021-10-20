import {InputSystem} from '../../../../bellows/shared/model/input-system.model';
import {LexOptionList} from './option-list.model';

export class LexConfig {
  hideIfEmpty: boolean;
  label: string;
  type: string;
  senseLabel?: string[];
}

export class LexConfigMultiText extends LexConfig {
  displayMultiline: boolean;
  inputSystems: string[];
  width: number;
}

export class LexConfigMultiParagraph extends LexConfig { }

export class LexConfigOptionList extends LexConfig {
  listCode: string;
}

export class LexConfigMultiOptionList extends LexConfigOptionList { }

export class LexConfigPictures extends LexConfigMultiText {
  captionLabel: string;
  captionHideIfEmpty: boolean;
}

export type LexConfigField = LexConfigFieldList | LexConfigMultiText | LexConfigMultiParagraph | LexConfigOptionList |
  LexConfigMultiOptionList | LexConfigPictures;

export class LexConfigFieldList extends LexConfig {
  fieldOrder: string[];
  fields: {
    [fieldName: string]: LexConfigField
  };
}

export class LexViewFieldConfig {
  show: boolean;
  type: string;
}

export class LexViewMultiTextFieldConfig extends LexViewFieldConfig {
  overrideInputSystems: boolean;
  inputSystems: string[];
}

export class LexRoleViewConfig {
  inputSystems: string[];
  fields: { [fieldType: string]: LexViewFieldConfig | LexViewMultiTextFieldConfig };
  showTasks: { [taskType: string]: boolean };
}

class LexTask {
  visible: boolean;
  type: string;
}

export class LexUserViewConfig extends LexRoleViewConfig { }

export interface LexConfigInputSystems {
  [tag: string]: InputSystem;
}

export interface LexConfigOptionLists {
  [listCode: string]: LexOptionList;
}

export class LexiconConfig {
  entry: LexConfigFieldList;
  inputSystems?: LexConfigInputSystems;
  optionlists?: LexConfigOptionLists;
  roleViews: { [role: string]: LexRoleViewConfig };
  tasks: { [taskType: string]: LexTask };
  userViews: { [userId: string]: LexUserViewConfig };
  pollUpdateIntervalMs?: number;
}
