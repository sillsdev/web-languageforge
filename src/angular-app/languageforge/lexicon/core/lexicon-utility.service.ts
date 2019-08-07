import * as angular from 'angular';

import {UtilityService} from '../../../bellows/core/utility.service';
import {LexEntry} from '../shared/model/lex-entry.model';
import {LexExample} from '../shared/model/lex-example.model';
import {LexSense} from '../shared/model/lex-sense.model';
import {LexValue} from '../shared/model/lex-value.model';
import {LexConfigFieldList, LexConfigMultiText, LexiconConfig} from '../shared/model/lexicon-config.model';
import {LexOptionList} from '../shared/model/option-list.model';

export class LexiconUtilityService extends UtilityService {
  static getLexeme(globalConfig: LexiconConfig, config: LexConfigFieldList, entry: LexEntry): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, entry, 'lexeme');
  }

  static getWords(globalConfig: LexiconConfig, config: LexConfigFieldList, entry: LexEntry): string {
    return LexiconUtilityService.getFields(globalConfig, config, entry, 'lexeme');
  }

  static getCitationForms(globalConfig: LexiconConfig, config: LexConfigFieldList, entry: LexEntry): string {
    let inputSystems: string[] = [];
    if (config != null && config.fields.citationForm != null) {
      inputSystems = [...(config.fields.citationForm as LexConfigMultiText).inputSystems];
    }
    if (config != null && config.fields.lexeme != null) {
      inputSystems = [...(config.fields.lexeme as LexConfigMultiText).inputSystems];
    }
    let citation = '';
    new Set(inputSystems).forEach((inputSystemTag: string) => {
      if (!LexiconUtilityService.isAudio(inputSystemTag)) {
        let valueToAppend = '';
        if (entry.citationForm != null && entry.citationForm[inputSystemTag] != null &&
          entry.citationForm[inputSystemTag].value !== ''
        ) {
          valueToAppend = entry.citationForm[inputSystemTag].value;
        } else if (entry.lexeme != null && entry.lexeme[inputSystemTag] != null &&
          entry.lexeme[inputSystemTag].value !== ''
        ) {
          valueToAppend = entry.lexeme[inputSystemTag].value;
        }

        if (valueToAppend) {
          if (citation) {
            citation += ' ' + valueToAppend;
          } else {
            citation += valueToAppend;
          }
        }
      }
    });
    return citation;
  }

  static getMeaning(globalConfig: LexiconConfig, config: LexConfigFieldList, sense: LexSense): string {
    let meaning = LexiconUtilityService.getDefinition(globalConfig, config, sense);
    if (!meaning) {
      meaning = LexiconUtilityService.getGloss(globalConfig, config, sense);
    }

    return meaning;
  }

  static getMeanings(globalConfig: LexiconConfig, config: LexConfigFieldList, sense: LexSense): string {
    let meaning = LexiconUtilityService.getFields(globalConfig, config, sense, 'definition');
    if (!meaning) {
      meaning = LexiconUtilityService.getFields(globalConfig, config, sense, 'gloss');
    }

    return meaning;
  }

  static getExample(globalConfig: LexiconConfig, config: LexConfigFieldList, example: LexExample,
                    field: string): string {
    if (field === 'sentence' || field === 'translation') {
      return LexiconUtilityService.getFields(globalConfig, config, example, field);
    }
  }

  static getPartOfSpeechAbbreviation(posModel: LexValue, optionlists: LexOptionList[]): string {
    if (posModel) {
      if (optionlists) {
        let abbreviation = '';
        for (const optionlist of optionlists) {
          if (optionlist.code === 'partOfSpeech' || optionlist.code === 'grammatical-info') {
            for (const item of optionlist.items) {
              if (item.key === posModel.value) {
                abbreviation = item.abbreviation;
              }
            }
          }
        }

        if (abbreviation) {
          return abbreviation;
        }
      }

      // capture text inside parentheses
      const myRegexp = /\((.*)\)/;
      const match = myRegexp.exec(posModel.value);
      if (match && match.length > 1) {
        return match[1];
      } else if (!posModel.value) {
        return '';
      } else {
        return posModel.value.toLowerCase().substring(0, 5);
      }
    }

    return '';
  }

  static isAtEditorList($state: angular.ui.IStateService): boolean {
    return $state.is('editor.list');
  }

  static isAtEditorEntry($state: angular.ui.IStateService): boolean {
    return $state.is('editor.entry');
  }

  private static getFields(globalConfig: LexiconConfig, config: LexConfigFieldList, node: any, fieldName: string,
                           delimiter: string = ' '): string {
    let result = '';
    const multiTextConfigField = config.fields[fieldName] as LexConfigMultiText;
    if (node[fieldName] && config && config.fields && multiTextConfigField && multiTextConfigField.inputSystems
    ) {
      for (const languageTag of multiTextConfigField.inputSystems ) {
        const fieldResult = LexiconUtilityService.getField(globalConfig, node, fieldName, languageTag);
        if (result) {
          result += delimiter + fieldResult;
        } else {
          result = fieldResult;
        }
      }
    }

    return result;
  }

  private static getField(globalConfig: LexiconConfig, node: any, fieldName: string, languageTag: string): string {
    let result = '';
    let field;
    if (node[fieldName]) {
      const inputSystem = globalConfig.inputSystems[languageTag];
      field = node[fieldName][languageTag];
      if (!LexiconUtilityService.isAudio(languageTag) && field != null && field.value != null && field.value !== '') {
        if (inputSystem && inputSystem.cssFontFamily && inputSystem.cssFontFamily !== '') {
          result = '<span style="font-family: ' + inputSystem.cssFontFamily + '">' + field.value + '</span>';
        } else {
          result = field.value;
        }
      }
    }
    return result;
  }

  private static getDefinition(globalConfig: LexiconConfig, config: LexConfigFieldList, sense: LexSense): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, sense, 'definition');
  }

  private static getGloss(globalConfig: LexiconConfig, config: LexConfigFieldList, sense: LexSense): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, sense, 'gloss');
  }

  private static getFirstField(globalConfig: LexiconConfig, config: LexConfigFieldList, node: any,
                               fieldName: string): string {
    let result = '';
    const multiTextConfigField = config.fields[fieldName] as LexConfigMultiText;
    if (node[fieldName] && multiTextConfigField && multiTextConfigField.inputSystems) {
      const inputSystems = multiTextConfigField.inputSystems;
      for (const languageTag of inputSystems) {
        result = LexiconUtilityService.getField(globalConfig, node, fieldName, languageTag);
        if (result !== '') {
          break;
        }
      }
    }

    return result;
  }

}
