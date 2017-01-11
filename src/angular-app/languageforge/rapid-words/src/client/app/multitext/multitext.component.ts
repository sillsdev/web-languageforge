import { Component, OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'multitext',
  templateUrl: 'multitext.component.html',
  styleUrls: ['multitext.component.css'],
})
export class MultitextComponent implements OnInit {

  label: string = "";
  language: string = "";
  content: string = "";

  constructor() { }

  ngOnInit() {
    this.getLanguage();
    this.getLabel();
    this.getContent();
  }

  getLanguage() {
    this.language = "en";
  }
  getLabel() {
    this.label = "Word";
  }
  getContent() {
    this.content = "bacon";
  }
}