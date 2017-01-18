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
        console.log('getFullDbeDto start');
        
        this.lfApiService.getFullDbeDto().subscribe(response => {
            this.allEntries = LexEntry.mapEntriesResponse(response.data.entries);
            console.log('getFullDbeDto end');
            
        });
    }

    getSettings() {
        this.lfApiService.getSettings().subscribe(
            configurationSettings => {
                this.wordLanguageSettings = this.extractLanguagesFromJSON(configurationSettings.data.entry.fields.lexeme.inputSystems);
                this.definitionLanguageSettings = this.extractLanguagesFromJSON(configurationSettings.data.entry.fields.senses.fields.definition.inputSystems);
                console.log('word languages:', this.wordLanguageSettings);
                console.log('definition languages', this.definitionLanguageSettings);
            });
    }

    extractLanguagesFromJSON(inputSystems: any) {
        console.log('enter the extraction', inputSystems, "again");
        var languageList: string[] = [];
        for (var i in inputSystems) {
            var language :string = inputSystems[i];
            console.log('language',language);
            languageList.push(language);
            console.log('languageList',languageList);
        }
        return languageList;
    }

    getNumberOfEntries() {
        return this.words.length;
    }

    userChoseDomain(semanticDomain: SemanticDomain) {
        this.selectedDomain = semanticDomain;
    }
}