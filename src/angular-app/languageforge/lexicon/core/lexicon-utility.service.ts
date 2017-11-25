import { UtilityService } from '../../../bellows/core/utility.service';

export class LexiconUtilityService extends UtilityService {
  getLexeme(config: any, entry: any): string {
    return LexiconUtilityService.getFirstField(config, entry, 'lexeme');
  }

  //noinspection JSUnusedGlobalSymbols
  getWords(config: any, entry: any): string {
    return this.getFields(config, entry, 'lexeme');
  }

  getCitationForms(config: any, entry: any): string {
    let inputSystems: string[] = [];
    if (config != null && config.fields.citationForm != null) {
      inputSystems = [...config.fields.citationForm.inputSystems];
    }
    if (config != null && config.fields.lexeme != null) {
      inputSystems = [...config.fields.lexeme.inputSystems];
    }
    let citation = '';
    new Set(inputSystems).forEach((inputSystemTag: string) => {
      if (!this.isAudio(inputSystemTag)) {
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

  getMeaning(config: any, sense: any): string {
    let meaning = LexiconUtilityService.getDefinition(config, sense);
    if (!meaning) {
      meaning = LexiconUtilityService.getGloss(config, sense);
    }

    return meaning;
  }

  getMeanings(config: any, sense: any): string {
    let meaning = this.getFields(config, sense, 'definition');
    if (!meaning) {
      meaning = this.getFields(config, sense, 'gloss');
    }

    return meaning;
  }

  getExample(config: any, example: any, field: string): string {
    if (field === 'sentence' || field === 'translation') {
      return this.getFields(config, example, field);
    }
  }

  getPartOfSpeechAbbreviation(posModel: any, optionlists: any[]): string {
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

  private getFields(config: any, node: any, fieldName: string, delimiter: string = ' '): string {
    let result = '';
    if (node[fieldName] && config && config.fields && config.fields[fieldName] && config.fields[fieldName].inputSystems
    ) {
      for (const languageTag of config.fields[fieldName].inputSystems ) {
        const field = node[fieldName][languageTag];
        if (!this.isAudio(languageTag) && field != null && field.value != null && field.value !== ''
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
