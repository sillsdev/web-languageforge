import { InputSystem } from './input-system.model';

class LexConfig {
  hideIfEmpty: boolean;
  label: string;
  type: string;
}

export class LexConfigMultiText extends LexConfig {
  displayMultiline: boolean;
  inputSystems: string[];
  width: number;
}

class LexConfigMultiParagraph extends LexConfig { }

class LexConfigOptionList extends LexConfig {
  listCode: string;
}

class LexConfigMultiOptionList extends LexConfigOptionList { }

class LexConfigPictures extends LexConfigMultiText {
  captionLabel: string;
  captionHideIfEmpty: boolean;
}

export class LexConfigFieldList extends LexConfig {
  fieldOrder: string[];
  fields: {
    [fialdName: string]: LexConfigFieldList | LexConfigMultiText | LexConfigMultiParagraph | LexConfigOptionList |
      LexConfigMultiOptionList | LexConfigPictures
  };
}

class LexViewFieldConfig {
  show: boolean;
  type: string;
}

class LexViewMultiTextFieldConfig extends LexViewFieldConfig {
  overrideInputSystems: boolean;
  inputSystems: string[];
}

class LexRoleViewConfig {
  fields: { [fieldType: string]: LexViewFieldConfig | LexViewMultiTextFieldConfig };
  showTasks: { [taskType: string]: boolean };
}

class LexTask {
  visible: boolean;
  type: string;
}

class LexOptionListItem {
  abbreviation: string;
  guid: string;
  key: string;
  value: string;
}

class LexOptionListModel {
  canDelete: boolean;
  code: string;
  defaultItemKey: string;
  id: string;
  items: LexOptionListItem[];
  name: string;
}

class LexUserViewConfig extends LexRoleViewConfig { }

export class LexiconConfig {
  entry: LexConfigFieldList;
  inputSystems?: { [tag: string]: InputSystem };
  optionlists?: { [listCode: string]: LexOptionListModel };
  roleViews: { [role: string]: LexRoleViewConfig };
  tasks: { [taskType: string]: LexTask };
  userViews: { [userId: string]: LexUserViewConfig };
}
