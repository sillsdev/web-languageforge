import * as angular from 'angular';

import {LexConfigField, LexConfigOptionList} from '../../shared/model/lexicon-config.model';
import {FieldControl} from '../field/field-control.model';

interface WindowService extends angular.IWindowService {
  semanticDomains_en?: any;
}

export class RegardingFieldController implements angular.IController {
  content: string;
  control: FieldControl;
  field: string;
  fieldConfig: LexConfigField;

  regarding: string = '';

  static $inject = ['$window'];
  constructor(private $window: WindowService) { }

  $onInit(): void {
    this.setContent();
  }

  $onChanges(changes: any): void {
    const fieldConfigChange = changes.fieldConfig as angular.IChangesObject<LexConfigField>;
    if (fieldConfigChange != null && fieldConfigChange.currentValue != null) {
      this.setContent();
    }
  }

  private setContent(): void {
    if (this.fieldConfig != null) {
      if (this.content != null) {
        if (this.fieldConfig.type === 'optionlist' || this.fieldConfig.type === 'multioptionlist') {
          if (this.field === 'semanticDomain') {
            // Semantic domains are in the global scope and appear to be English only
            // Will need to be updated once the system provides support for other languages
            for (const i in this.$window.semanticDomains_en) {
              if (this.$window.semanticDomains_en.hasOwnProperty(i) &&
                this.$window.semanticDomains_en[i].key === this.content
              ) {
                this.regarding = this.$window.semanticDomains_en[i].value;
              }
            }
          } else {
            const optionlists = this.control.config.optionlists;
            for (const listCode in optionlists) {
              if (optionlists.hasOwnProperty(listCode) &&
                listCode === (this.fieldConfig as LexConfigOptionList).listCode
              ) {
                for (const i in optionlists[listCode].items) {
                  if (optionlists[listCode].items.hasOwnProperty(i) &&
                    optionlists[listCode].items[i].key === this.content
                  ) {
                    this.regarding = optionlists[listCode].items[i].value;
                  }
                }
              }
            }
          }
        } else {
          this.regarding = this.content;
        }
      }
    }
  }

}

export const RegardingFieldComponent: angular.IComponentOptions = {
  bindings: {
    content: '<',
    control: '<',
    field: '<',
    fieldConfig: '<'
  },
  controller: RegardingFieldController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/comment/regarding-field.component.html'
};
