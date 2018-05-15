import * as angular from 'angular';

import {LexiconUtilityService} from '../../core/lexicon-utility.service';
import {LexEntry} from '../../shared/model/lex-entry.model';
import {LexConfigFieldList, LexiconConfig} from '../../shared/model/lexicon-config.model';
import {LexOptionList} from '../../shared/model/option-list.model';

class Example {
  sentence: string;
  translation: string;
}

class Sense {
  meaning: string;
  partOfSpeech: string;
  examples: Example[] = [];
}

class Entry {
  word: string = '';
  senses: Sense[] = [];
}

export class FieldRenderedController implements angular.IController {
  config: LexConfigFieldList;
  globalConfig: LexiconConfig;
  model: LexEntry;
  optionLists: LexOptionList[];
  hideIfEmpty: boolean;

  entry: Entry = new Entry();

  static $inject = ['$scope'];
  constructor(private $scope: angular.IScope) { }

  $onInit(): void {
    if (this.hideIfEmpty == null) {
      this.hideIfEmpty = false;
    }

    this.$scope.$watch(() => this.model, this.render, true);
  }

  private render = () => {
    if (this.config == null || this.model == null) {
      return;
    }

    let lastPos: string = null;
    let pos: string;
    this.entry = new Entry();
    this.entry.word = LexiconUtilityService.getCitationForms(this.globalConfig, this.config, this.model);
    const sensesConfig = this.config.fields.senses as LexConfigFieldList;
    const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
    if (this.model.senses != null) {
      for (const senseModel of this.model.senses) {
        const sense: Sense = new Sense();
        pos = LexiconUtilityService.getPartOfSpeechAbbreviation(senseModel.partOfSpeech, this.optionLists);

        // do not repeat parts of speech
        if (lastPos === pos) {
          pos = '';
        } else {
          lastPos = pos;
        }

        sense.meaning = LexiconUtilityService.getMeanings(this.globalConfig, sensesConfig, senseModel);
        sense.partOfSpeech = pos;
        if (senseModel.examples != null) {
          for (const exampleModel of senseModel.examples) {
            const example: Example = new Example();
            example.sentence = LexiconUtilityService.getExample(this.globalConfig, examplesConfig, exampleModel,
              'sentence');
            example.translation = LexiconUtilityService.getExample(this.globalConfig, examplesConfig, exampleModel,
              'translation');
            sense.examples.push(example);
          }
        }

        this.entry.senses.push(sense);
      }
    }
  }

}

export const FieldRenderedComponent: angular.IComponentOptions = {
  bindings: {
    config: '<',
    globalConfig: '<',
    model: '<',
    optionLists: '<',
    hideIfEmpty: '<?'
  },
  controller: FieldRenderedController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-rendered.component.html'
};
