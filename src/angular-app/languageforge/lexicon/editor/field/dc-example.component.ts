import * as angular from 'angular';

import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexExample} from '../../shared/model/lex-example.model';
import {LexConfigFieldList} from '../../shared/model/lexicon-config.model';
import {FieldControl} from './field-control.model';

export class FieldExampleController implements angular.IController {
  model: LexExample;
  config: LexConfigFieldList;
  control: FieldControl;
  index: number;
  parentContextGuid: string;
  numExamples: () => number;
  move: (index: number, distance: number) => void;
  remove: (index: number) => void;

  contextGuid: string;

  static $inject = ['$state'];
  constructor(private $state: angular.ui.IStateService) { }

  $onInit(): void {
    this.contextGuid = this.parentContextGuid + ' example#' + this.model.guid;

    for (const fieldName in this.config.fields) {
      if (this.config.fields.hasOwnProperty(fieldName)) {
        const field = this.config.fields[fieldName];
        if (field.senseLabel == null) {
          field.senseLabel = [];
          field.senseLabel[-1] = 'Example';
        }

        field.senseLabel[this.index] = 'Example ' + (this.index + 1);
      }
    }
  }

  isAtEditorEntry(): boolean {
    return LexiconUtilityService.isAtEditorEntry(this.$state);
  }

}

export const FieldExampleComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    index: '<',
    parentContextGuid: '<',
    numExamples: '<',
    move: '<',
    remove: '<'
  },
  controller: FieldExampleController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-example.component.html'
};
