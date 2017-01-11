import { Component, OnInit } from '@angular/core';
import { NameListService } from '../shared/name-list/name-list.service';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';

@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {

  semanticDomains: any[] = [];
  words: any[] = [];
  numberOfEntries: number = 0;

  /**
   * Creates an instance of the HomeComponent with the injected
   * SemanticDomainListService.
   *
   * 
   * @param {SemanticDomainListService} semanticDomainListService
   */

  constructor(public semanticDomainListService: SemanticDomainListService) { }

  ngOnInit() {
    this.getSemanticDomains();
    this.getWords();
    this.getNumberOfEntries();
  }
  getNumberOfEntries() {
    this.numberOfEntries = this.words.length;
  }
  getWords() {
    this.words = ["lemon", "grape", "carrot", "dragon eye", "jicama"];
  }
  getSemanticDomains() {
    this.semanticDomainListService.get()
      .subscribe(
      semanticDomains => this.semanticDomains = semanticDomains,

    );
  }
}