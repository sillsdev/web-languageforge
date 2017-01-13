import { Component, OnInit, Input } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'multitext',
  templateUrl: 'multitext.component.html',
  styleUrls: ['multitext.component.css'],
})
export class MultitextComponent implements OnInit {

  @Input() label: string = "";
  language: string = "";
  content: string = "";

  constructor() { }

  ngOnInit() {
    this.getLanguage();
    this.getContent();
  }

  getLanguage() {
    //placeholder to be switched for real data
    this.language = "en";
  }
  getLabel() {
    //placeholder to be switched for real data
    this.label = "Word";
  }
  getContent() {
    //placeholder to be switched for real data
    this.content = "bacon";
  }
  
}