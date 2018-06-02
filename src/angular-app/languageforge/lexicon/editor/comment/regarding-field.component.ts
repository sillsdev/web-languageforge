import * as angular from 'angular';

import {SemanticDomainsService} from '../../../core/semantic-domains/semantic-domains.service';
import {LexConfigField, LexConfigOptionList} from '../../shared/model/lexicon-config.model';
import {FieldControl} from '../field/field-control.model';

export class RegardingFieldController implements angular.IController {
  content: string;
  control: FieldControl;
  field: string;
  fieldConfig: LexConfigField;

  regarding: string = '';

  static $inject = ['semanticDomainsService'];
  constructor(private readonly semanticDomains: SemanticDomainsService) { }

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
            for (const key in this.semanticDomains.data) {
              if (this.semanticDomains.data.hasOwnProperty(key) && key === this.content) {
                this.regarding = this.semanticDomains.data[key].value;
                break;
              }
            }
          } else {
            const optionLists = this.control.config.optionlists;
            outerFor:
            for (const listCode in optionLists) {
              if (optionLists.hasOwnProperty(listCode) &&
                listCode === (this.fieldConfig as LexConfigOptionList).listCode
              ) {
                for (const i in optionLists[listCode].items) {
                  if (optionLists[listCode].items.hasOwnProperty(i) &&
                    optionLists[listCode].items[i].key === this.content
                  ) {
                    this.regarding = optionLists[listCode].items[i].value;
                    break outerFor;
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
