import {browser, by, element, Key} from 'protractor';
import {ElementArrayFinder, ElementFinder} from 'protractor/built/element';

// Utility functions for parsing dc-* directives (dc-multitext, etc)
export class EditorUtil {
  // --- Parsing fields ---

  // Return the multitext's values as [{wsid: 'en', value: 'word'}, {wsid: 'de', value: 'Wort'}]
  // NOTE: Returns a promise. Use .then() to access the actual data.
  dcMultitextToArray = (elem: ElementFinder|ElementArrayFinder) => {
    const inputSystemDivs = elem.all(by.repeater('tag in $ctrl.config.inputSystems'));
    return inputSystemDivs.map((div: any) => {
      const wsidSpan = div.element(by.css('.input-group > span.wsid'));
      const wordInput = div.element(by.css('.input-group > .dc-text textarea'));
      return wsidSpan.getText().then((wsid: any) => {
        return wordInput.isPresent().then((isWordPresent: boolean) => {
          if (isWordPresent) {
            return wordInput.getAttribute('value').then((word: string) => {
              return {
                wsid,
                value: word
              };
            });
          } else {
            return { wsid, value: '' };
          }
        });
      });
    });
  }

  // Return the multitext's values as {en: 'word', de: 'Wort'}
  // NOTE: Returns a promise. Use .then() to access the actual data.
  dcMultitextToObject = (elem: ElementFinder|ElementArrayFinder) => {
    return this.dcMultitextToArray(elem).then((values: any) => {
      const result = {};
      for (let i = 0, l = values.length; i < l; i++) {
        result[values[i].wsid] = values[i].value;
      }

      return result;
    });
  }

  // Returns the value of the multitext's first writing system, no matter what writing system is
  // first. NOTE: Returns a promise. Use .then() to access the actual data.
  dcMultitextToFirstValue = (elem: ElementFinder|ElementArrayFinder) => {
    return this.dcMultitextToArray(elem).then((values: any) => {
      return values[0].value;
    });
  }

  static dcOptionListToValue(elem: any) {
    const select = elem.element(by.css('.controls select'));
    return select.element(by.css('option:checked')).getText().then((text: string) => {
      return text;
    });
  }

  // At the moment these are identical to dc-optionlist directives.
  // When they change, this function will need to be rewritten
  dcMultiOptionListToValue = EditorUtil.dcOptionListToValue;

  dcPicturesToObject = (elem: ElementFinder|ElementArrayFinder) => {
    const pictures = elem.all(by.repeater('picture in $ctrl.pictures'));
    return pictures.map((div: any) => {
      const img = div.element(by.css('img'));
      const caption = div.element(by.css('dc-multitext'));
      return img.getAttribute('src').then((src: string) => {
        return {
          fileName: src.replace(/^.*[\\\/]/, ''),
          caption: this.dcMultitextToObject(caption)
        };
      });
    });
  }

  dcParsingFuncs = {
    multitext: {
      multitext_as_object: this.dcMultitextToObject,
      multitext_as_array: this.dcMultitextToArray,
      multitext_as_first_value: this.dcMultitextToFirstValue,
      default_strategy: 'multitext_as_object'
    },
    optionlist: EditorUtil.dcOptionListToValue,
    multioptionlist: this.dcMultiOptionListToValue,
    pictures: this.dcPicturesToObject
  };

  getParser(elem: any, multitextStrategy: string = this.dcParsingFuncs.multitext.default_strategy) {
    const switchDiv = elem.element(by.css('[data-on="$ctrl.config.fields[fieldName].type"] > div'));
    return switchDiv.getAttribute('data-ng-switch-when').then((fieldType: any) => {
      let parser;
      if (fieldType === 'multitext') {
        parser = this.dcParsingFuncs[fieldType][multitextStrategy];
      } else {
        parser = this.dcParsingFuncs[fieldType];
      }

      return parser;
    });
  }

  parseDcField(elem: any, multitextStrategy?: string) {
    return this.getParser(elem, multitextStrategy).then((parser: any) => parser(elem));
  }

  static getFields(searchLabel: string, rootElem: ElementFinder = element(by.className('dc-entry'))) {
    return rootElem.all(by.cssContainingText('div[data-ng-repeat="fieldName in $ctrl.config.fieldOrder"]', searchLabel)).filter(elem => {
      return elem.getText().then(text => {
        // getText returns text including child elements, which for fields is generally on a new line
        if(text.indexOf('\n') !== -1) text = text.substring(0, text.indexOf('\n'));
        return text === searchLabel;
      })
    });
  }

  getFieldValues(searchLabel: string, rootElem: ElementFinder = element(by.className('dc-entry')),
                 multitextStrategy?: string) {
    return EditorUtil.getFields(searchLabel, rootElem).map(
      (fieldElem: any) => this.parseDcField(fieldElem, multitextStrategy)
    );
  }

  static getOneField(searchLabel: string, idx: number = 0,
                     rootElem: ElementFinder = element(by.className('dc-entry'))) {
    return EditorUtil.getFields(searchLabel, rootElem).get(idx);
  }

  getOneFieldValue(searchLabel: string, idx: number = 0, rootElem: ElementFinder = element(by.className('dc-entry')),
                   multitextStrategy?: string) {
    const fieldElement = EditorUtil.getOneField(searchLabel, idx, rootElem);
    return this.parseDcField(fieldElement, multitextStrategy);
  }

  // For convenience in writing test code, since the values in testConstants don't match the
  // displayed values. No need to worry about localization here, since E2E tests are all run in the
  // English-language interface.
  partOfSpeechNames = {
    adj: 'Adjective',
    adv: 'Adverb',
    cla: 'Classifier',
    n: 'Noun',
    nprop: 'Proper Noun',
    num: 'Numeral',
    p: 'Particle',
    prep: 'Preposition',
    pro: 'Pronoun',
    v: 'Verb'
  };

  // Take an abbreviation for a part of speech and return the value that will
  // appear in the Part of Speech dropdown (for convenience in E2E tests).
  expandPartOfSpeech(posAbbrev: string) {
    return this.partOfSpeechNames[posAbbrev] + ' (' + posAbbrev + ')';
  }

  // designed for use with Text-Angular controls (i.e. that don't have ordinary input or textarea)
  selectElement = {
    async sendKeys(elem: any, keys: string) {
      await elem.click();
      return elem.sendKeys(keys);
    },

    async clear(elem: any) {
      // fix problem with protractor not scrolling to element before click
      await elem.getLocation().then((navDivLocation: any) => {
        const initTop = (navDivLocation.y - 150) > 0 ? navDivLocation.y - 150 : 1;
        const initLeft = navDivLocation.x;
        browser.executeScript('window.scrollTo(' + initLeft + ',' + initTop + ');');
      });

      await elem.click();
      const ctrlA = Key.chord(Key.CONTROL, 'a');
      await elem.sendKeys(ctrlA);
      return elem.sendKeys(Key.DELETE);
    }
  };
}
