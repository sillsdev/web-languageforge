import { UtilityService } from '../../../bellows/core/utility.service';

export class LexiconUtilityService extends UtilityService {
  static getLexeme(config: any, entry: any): string {
    return LexiconUtilityService.getFirstField(config, entry, 'lexeme');
  }

  static getWords(config: any, entry: any): string {
    return LexiconUtilityService.getFields(config, entry, 'lexeme');
  }

  static getCitationForms(config: any, entry: any): string {
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

  static getMeaning(config: any, sense: any): string {
    let meaning = LexiconUtilityService.getDefinition(config, sense);
    if (!meaning) {
      meaning = LexiconUtilityService.getGloss(config, sense);
    }

    return meaning;
  }

  static getMeanings(config: any, sense: any): string {
    let meaning = LexiconUtilityService.getFields(config, sense, 'definition');
    if (!meaning) {
      meaning = LexiconUtilityService.getFields(config, sense, 'gloss');
    }

    return meaning;
  }

  static getExample(config: any, example: any, field: string): string {
    if (field === 'sentence' || field === 'translation') {
      return LexiconUtilityService.getFields(config, example, field);
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

  private static getFields(config: any, node: any, fieldName: string, delimiter: string = ' '): string {
    let result = '';
    if (node[fieldName] && config && config.fields && config.fields[fieldName] && config.fields[fieldName].inputSystems
    ) {
      for (const languageTag of config.fields[fieldName].inputSystems ) {
        const field = node[fieldName][languageTag];
        if (!LexiconUtilityService.isAudio(languageTag) && field != null && field.value != null && field.value !== ''
        ) {
          if (result) {
            result += delimiter + field.value;
          } else {
            result = field.value;
          }
        }
      }
    }

    return result;
  }

  private static getDefinition(config: any, sense: any): string {
    return LexiconUtilityService.getFirstField(config, sense, 'definition');
  }

  private static getGloss(config: any, sense: any): string {
    return LexiconUtilityService.getFirstField(config, sense, 'gloss');
  }

  private static getFirstField(config: any, node: any, fieldName: string): string {
    let result = '';
    let field;
    if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
      config.fields[fieldName].inputSystems) {
      for (const languageTag of config.fields[fieldName].inputSystems) {
        field = node[fieldName][languageTag];
        if (field != null && field.value != null && field.value !== '') {
          result = field.value;
          break;
        }
      }
    }

    return result;
  }

}
