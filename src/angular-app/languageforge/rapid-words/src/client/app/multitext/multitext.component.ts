import { Component, Input, OnInit } from '@angular/core';

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
}