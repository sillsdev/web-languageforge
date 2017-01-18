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

  // @Input('label') public label: string = "";
  @Input('languages') public languages: string[] = [];
  @Input('content') public content: string[] = [];
  @Input('label') label: string;

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

}
