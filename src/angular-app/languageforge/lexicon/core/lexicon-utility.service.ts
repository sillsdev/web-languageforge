import { UtilityService } from '../../../bellows/core/utility.service';

export class LexiconUtilityService extends UtilityService {
  static getLexeme(globalConfig: any, config: any, entry: any): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, entry, 'lexeme');
  }

  static getWords(globalConfig: any, config: any, entry: any): string {
    return LexiconUtilityService.getFields(globalConfig, config, entry, 'lexeme');
  }

  static getCitationForms(globalConfig: any, config: any, entry: any): string {
    let inputSystems: string[] = [];
    if (config != null && config.fields.citationForm != null) {
      inputSystems = [...config.fields.citationForm.inputSystems];
    }
    if (config != null && config.fields.lexeme != null) {
      inputSystems = [...config.fields.lexeme.inputSystems];
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

  static getMeaning(globalConfig: any, config: any, sense: any): string {
    let meaning = LexiconUtilityService.getDefinition(globalConfig, config, sense);
    if (!meaning) {
      meaning = LexiconUtilityService.getGloss(globalConfig, config, sense);
    }

    return meaning;
  }

  static getMeanings(globalConfig: any, config: any, sense: any): string {
    let meaning = LexiconUtilityService.getFields(globalConfig, config, sense, 'definition');
    if (!meaning) {
      meaning = LexiconUtilityService.getFields(globalConfig, config, sense, 'gloss');
    }

    return meaning;
  }

  static getExample(globalConfig: any, config: any, example: any, field: string): string {
    if (field === 'sentence' || field === 'translation') {
      return LexiconUtilityService.getFields(globalConfig, config, example, field);
    }
  }

  static getPartOfSpeechAbbreviation(posModel: any, optionlists: any[]): string {
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

  private static getFields(globalConfig: any, config: any, node: any, fieldName: string,
                           delimiter: string = ' '): string {
    let result = '';
    if (node[fieldName] && config && config.fields && config.fields[fieldName] && config.fields[fieldName].inputSystems
    ) {
      for (const languageTag of config.fields[fieldName].inputSystems ) {
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

  private static getField(globalConfig: any, node: any, fieldName: string, languageTag: string): string {
    let result = '';
    let field;
    if (node[fieldName]) {
      const inputSystem = globalConfig.inputSystems[languageTag];
      field = node[fieldName][languageTag];
      if (!LexiconUtilityService.isAudio(languageTag) && field != null && field.value != null && field.value !== '') {
        if (inputSystem.cssFontFamily && inputSystem.cssFontFamily !== '') {
          result = '<span style="font-family: ' + inputSystem.cssFontFamily + '">' + field.value + '</span>';
        } else {
          result = field.value;
        }
      }
    }
    return result;
  }

  private static getDefinition(globalConfig: any, config: any, sense: any): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, sense, 'definition');
  }

  private static getGloss(globalConfig: any, config: any, sense: any): string {
    return LexiconUtilityService.getFirstField(globalConfig, config, sense, 'gloss');
  }

  private static getFirstField(globalConfig: any, config: any, node: any, fieldName: string): string {
    let result = '';
    if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
      config.fields[fieldName].inputSystems) {
      const inputSystems = config.fields[fieldName].inputSystems;
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
