import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Constants } from '../shared/constants';
import { LexEntry, LexSense } from '../shared/models/lex-entry';

@Component({
  moduleId: module.id,
  selector: 'multitext',
  templateUrl: 'multitext.component.html',
  styleUrls: ['multitext.component.css'],
})
export class MultitextComponent implements OnInit {
  private _selectedEntry: LexEntry;

  @Input('languages') public languages: string[] = [];
  @Input('content') public content: string[] = [];
  @Input('label') label: string;

  @Input('selectedEntry')
  set selectedEntry(entry: LexEntry) {
    this._selectedEntry = entry;
    this.updateContentFromLexEntry(entry);
  }

  constructor() {

   }

  ngOnInit() {
    this.getLanguages();
    this.getLabel();
    this.getContent();
  }

  getLanguages() {
  }

  getLabel() {
  }

  getContent() {
  }

  addLexemeOrSenseToLexEntry(lexEntry: LexEntry) {
    if (this.label == Constants.MultitextEntry.WORD_COMPONENT) { //lexeme
      for (let langIndex in this.languages) {
        lexEntry.lexeme[this.languages[langIndex]] = { value: this.content[langIndex] };
      }
    } else {
      var lexSense = new LexSense();

      for (let langIndex in this.languages) {
        lexSense.definition[this.languages[langIndex]] =  { value: this.content[langIndex] };
      }
      lexEntry.senses.push(lexSense);
    }
  }

  updateContentFromLexEntry(lexEntry: LexEntry) {
    if (!lexEntry) {
      return;
    }

    if (this.label == Constants.MultitextEntry.WORD_COMPONENT) {
      for (let langIndex in this.languages) {
        let wordForLang = lexEntry.lexeme[this.languages[langIndex]];
        if (wordForLang) {
          this.content[langIndex] = wordForLang.value;
        } else {
          this.content[langIndex] = '';
        }
      }
    } else {
      for (let lexSense of lexEntry.senses) {
        for (let langIndex in this.languages) {
          let definitionForLang = lexSense.definition[this.languages[langIndex]];
          if (definitionForLang) {
            this.content[langIndex] = definitionForLang.value;
          } else {
            this.content[langIndex] = '';
          }
        }
      }
    }
  }

}
