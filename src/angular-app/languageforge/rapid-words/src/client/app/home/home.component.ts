import { Component, OnInit } from '@angular/core';
import { NameListService } from '../shared/name-list/name-list.service';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {

  newName: string = '';
  errorMessage: string;
  // names: any[] = [];
  semanticDomains: any[] = [];
  words: any[] = [];

  /**
   * Creates an instance of the HomeComponent with the injected
   * NameListService.
   *
   * 
   * @param {SemanticDomainListService} semanticDomainListService
   */
  // constructor(public nameListService: NameListService) {}
  constructor(public semanticDomainListService: SemanticDomainListService) {}

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    // this.getNames();
    this.getSemanticDomains();
    this.getWords();
  }

  /**
   * Handle the nameListService observable
   */
  getWords() {
    this.words = ["lemon", "grape", "carrot", "dragon eye", "jicama"];
  }
  getSemanticDomains() {
    this.semanticDomainListService.get()
    .subscribe(
        semanticDomains => this.semanticDomains = semanticDomains,
        error => this.errorMessage = <any>error
      );
  }
  // getNames() {
  //   this.nameListService.get()
  //     .subscribe(
  //       names => this.names = names,
  //       error => this.errorMessage = <any>error
  //     );
  // }

  /**
   * Pushes a new name onto the names array
   * @return {boolean} false to prevent default form submit behavior to refresh the page.
   */
  // addName(): boolean {
  //   // TODO: implement nameListService.post
  //   this.names.push(this.newName);
  //   this.newName = '';
  //   return false;
  // }

}
