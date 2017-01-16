import {Component, OnInit, Output, EventEmitter, ViewChild} from '@angular/core';
import { Http } from '@angular/http';
import {NameListService} from '../shared/name-list/name-list.service';
import {SemanticDomain} from '../shared/models/semantic-domain.model';
import { LfApiService } from '../shared/services/lf-api.service';
import {WordDetailsComponent} from '../word-details/word-details.component';
import { Constants } from '../shared/constants';
import { LexEntry } from '../shared/models/lex-entry';

@Component({
    moduleId: module.id,
    selector: 'sd-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
    selectedDomain: string = "None";
    words: any[] = [];
    numberOfEntries: number = 0;
  allEntries: LexEntry[];
    @ViewChild(WordDetailsComponent)
    private detailToggle: WordDetailsComponent;

  /**
   * Creates an instance of the HomeComponent with the injected
   * SemanticDomainListService.
   *
   * 
   * @param {SemanticDomainListService} semanticDomainListService
   */

  constructor(private lfApiService: LfApiService) { }
    multitextShowDetails() {
        this.detailToggle.toggleShowDetails();
    }

    ngOnInit() {
        // this.getSemanticDomains();
        this.getWords();
        this.getNumberOfEntries();
    this.getFullDbeDto(); 
    }

  getFullDbeDto() {
    this.lfApiService.getFullDbeDto().subscribe( response => {
      this.allEntries = LexEntry.mapEntriesResponse(response.data.entries);
    });
  }

    getNumberOfEntries() {
        this.numberOfEntries = this.words.length;
    }

    getWords() {
        this.words = ["Nysha", "grape", "carrot", "dragon eye", "jicama"];
    }

    userChoseDomain(semanticDomain: SemanticDomain) {
        this.selectedDomain = semanticDomain.value;
    }
}