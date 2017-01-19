import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Http } from '@angular/http';
import { NameListService } from '../shared/name-list/name-list.service';
import { SemanticDomain } from '../shared/models/semantic-domain.model';
import { LfApiService } from '../shared/services/lf-api.service';
import { WordDetailsComponent } from '../word-details/word-details.component';
import { Constants } from '../shared/constants';
import { LexEntry } from '../shared/models/lex-entry';

@Component({
    moduleId: module.id,
    selector: 'sd-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
})
export class HomeComponent implements OnInit {
    selectedDomain: SemanticDomain;
    words: any[] = [];
    wordLanguageSettings: string[] = [];
    definitionLanguageSettings: string[] = [];

    allEntries: LexEntry[];
    @ViewChild(WordDetailsComponent)
    private detailToggle: WordDetailsComponent;
    selectedEntry = new LexEntry();

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
        this.getNumberOfEntries();
        this.getFullDbeDto(); 
        this.getSettings();
    }

    getFullDbeDto() {
        this.lfApiService.getFullDbeDto().subscribe(response => {
            this.allEntries = LexEntry.mapEntriesResponse(response.data.entries);
        });
    }

    getSettings() {
        this.lfApiService.getSettings().subscribe(
            configurationSettings => {
                this.wordLanguageSettings = this.extractLanguagesFromJSON(configurationSettings.data.entry.fields.lexeme.inputSystems);
                this.definitionLanguageSettings = this.extractLanguagesFromJSON(configurationSettings.data.entry.fields.senses.fields.definition.inputSystems);
            });
    }

    extractLanguagesFromJSON(inputSystems: any) {
        var languageList: string[] = [];
        for (var i in inputSystems) {
            var language :string = inputSystems[i];
            languageList.push(language);
        }
        return languageList;
    }

    getNumberOfEntries() {
        return this.words.length;
    }

    userChoseDomain(semanticDomain: SemanticDomain) {
        this.selectedDomain = semanticDomain;
    }

    /**
     * This fires whenever an entry is selected from the word list.
     * The selected entry trickles down to the word-details child and multitext grandchild
     * (see: multitext.component and word-details.component)
     */
    onEntrySelectedInList(entry: LexEntry) {
        this.selectedEntry = entry;
    }
}