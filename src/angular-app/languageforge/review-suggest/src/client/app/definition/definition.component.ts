import { Component, OnInit } from '@angular/core';
import { Dictionary } from '../shared/models/dictionary';

import { DictionaryService } from '../shared/services/dictionary.service';

@Component({
  moduleId: module.id,
  selector: 'definition',
  templateUrl: 'definition.component.html'
})
export class DefinitionComponent implements OnInit {

  title = 'Definition';
  idx = 0;
  currentWord: Dictionary;
  deck: Dictionary[];

  constructor(public dictionaryService: DictionaryService) { }

  ngOnInit(): void {
    this.getDeck();
  }

  getDeck(): void {
    this.dictionaryService.getWords().then(deck => {
      this.deck = deck;
      this.currentWord = this.deck[this.idx];
    });
  }

  public incrementWord = () => {
    this.idx += 1;
    if (this.idx > this.deck.length - 1) {
      this.idx = 0;
    }
    this.currentWord = this.deck[this.idx]
  }

  public decreaementWord = () => {
    this.idx -= 1;
    if (this.idx < 0) {
      this.idx = this.deck.length - 1;
    }
    this.currentWord = this.deck[this.idx];
  }


  public upVote = () => {
    this.incrementWord();
    console.log("I upvoted " + this.currentWord.id);
  }

  public unsureVote = () => {
    this.incrementWord();
    console.log("I voted IDK " + this.currentWord.id);
  }

  public downVote = () => {
    this.incrementWord();
    console.log("I downvoted " + this.currentWord.id);
  }
}