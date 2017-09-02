import { UtilityService } from '../../../bellows/core/utility.service';

export class LexiconUtilityService extends UtilityService {
  getLexeme(config: any, entry: any): string {
    return this.getFirstField(config, entry, 'lexeme');
  }

  //noinspection JSUnusedGlobalSymbols
  getWords(config: any, entry: any): string {
    return this.getFields(config, entry, 'lexeme');
  }

  getCitationForms(config: any, entry: any): string {
    if (entry.lexeme == null) {
      return '';
    }

    let citation = '';
    let citationFormByInputSystem = {};
    if (config.fields.citationForm != null) {
      for (let inputSystemTag of config.fields.citationForm.inputSystems) {
        if (entry.citationForm != null) {
          let field = entry.citationForm[inputSystemTag];
          if (field != null && field.value != null && field.value !== '' &&
              !this.isAudio(inputSystemTag)
          ) {
            citationFormByInputSystem[inputSystemTag] = field.value;
          }
        }
      }
    }

    for (let inputSystemTag of config.fields.lexeme.inputSystems) {
      let field = entry.lexeme[inputSystemTag];
      let valueToAppend = '';
      if (citationFormByInputSystem[inputSystemTag] != null) {
        valueToAppend = citationFormByInputSystem[inputSystemTag];
      } else if (field != null && field.value != null && !this.isAudio(inputSystemTag)) {
        valueToAppend = field.value;
      }

      if (valueToAppend) {
        if (citation) {
          citation += ' ' + valueToAppend;
        } else {
          citation += valueToAppend;
        }
      }
    }

    return citation;
  }

  getDefinition(config: any, sense: any): string {
    return this.getFirstField(config, sense, 'definition');
  }

  getGloss(config: any, sense: any): string {
    return this.getFirstField(config, sense, 'gloss');
  }

  getMeaning(config: any, sense: any): string {
    let meaning = this.getDefinition(config, sense);
    if (!meaning) {
      meaning = this.getGloss(config, sense);
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
        for (let optionlist of optionlists) {
          if (optionlist.code === 'partOfSpeech' || optionlist.code === 'grammatical-info') {
            for (let item of optionlist.items) {
              if (item.key === posModel.value) {
                abbreviation = item.abbreviation;
              }
            }
          }
        }

        if (abbreviation)
          return abbreviation;
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
    if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
      config.fields[fieldName].inputSystems) {
      for (let inputSystem of config.fields[fieldName].inputSystems ) {
        let field = node[fieldName][inputSystem];
        if (!this.isAudio(inputSystem) && field != null && field.value != null && field.value !== ''
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

  private getFirstField(config: any, node: any, fieldName: string): string {
    let result = '';
    let ws;
    let field;
    if (node[fieldName] && config && config.fields && config.fields[fieldName] &&
      config.fields[fieldName].inputSystems) {
      for (let i in config.fields[fieldName].inputSystems) {
        ws = config.fields[fieldName].inputSystems[i];
        field = node[fieldName][ws];
        if (field != null && field.value != null && field.value !== '') {
          result = field.value;
          break;
        }
      }
    }

    return result;
  }

}
