import { Component, OnInit } from '@angular/core';
// import { NameListService } from '../shared/name-list/name-list.service';
// import { SemanticDomainListService } from '../shared/main-view/main-view.service';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'meaningdetails',
  templateUrl: 'meaning-details.component.html',
  styleUrls: ['meaning-details.component.css'],
})
export class MeaningDetailsComponent {

//   newName: string = '';
  errorMessage: string;
  // names: any[] = [];
  semanticDomains: any[] = [];
  words: any[] = [];
  numberOfEntries: number = 0;
  label: string= "Word";
  language: string="en";
  content: string="bacon";

  /**
   * Creates an instance of the HomeComponent with the injected
   * NameListService.
   *
   * 
   * @param {SemanticDomainListService} semanticDomainListService
   */
  // constructor(public nameListService: NameListService) {}
  constructor() {}
}
  /**
   * Get the names OnInit
   */
//   ngOnInit() {
//     // this.getNames();
//     // this.getSemanticDomains();
//     // this.getWords();
//     // this.getNumberOfEntries();
//   }

  /**
   * Handle the nameListService observable
   */
