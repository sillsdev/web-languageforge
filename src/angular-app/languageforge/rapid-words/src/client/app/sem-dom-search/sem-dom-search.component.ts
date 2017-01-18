import {Component, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {SemanticDomain} from '../shared/models/semantic-domain.model';
import {SemanticDomainDataService} from './sem-dom-data.service';
import {SemanticDomainCollection} from '../shared/models/semantic-domain.model';

@Component({
    moduleId: module.id,
    selector: 'sem-dom-search',
    templateUrl: 'sem-dom-search.component.html',
    styleUrls: ['sem-dom-search.component.css']
})
export class SemanticDomainSearchComponent {
    @Output() domainSelected: EventEmitter<SemanticDomain> = new EventEmitter();

    selectedDomain: SemanticDomain;
    searchText: FormControl = new FormControl();
    searchResults: Array<SemanticDomain> = [];
    semanticDomains: SemanticDomainCollection = {};
    searchEnabled = false;

    constructor(private semanticDomainDataService: SemanticDomainDataService) {
        this.semanticDomains = semanticDomainDataService.getSemanticDomains();

        this.searchText.valueChanges
            .debounceTime(100)
            .distinctUntilChanged()
            .subscribe(search_text => {
                if(!this.searchEnabled) return;
                this.clearSearchResults();

                Object.keys(this.semanticDomains).forEach((key: string) => {
                    let sem_dom: SemanticDomain = this.semanticDomains[key];

                    if (sem_dom.key.indexOf(search_text) >= 0 ||
                        sem_dom.name.indexOf(search_text) >= 0 ||
                        sem_dom.description.indexOf(search_text) >= 0) {
                        this.searchResults.push(sem_dom);
                    }
                });
            });
    }

    // Domain was selected from the select box. Look it up and emit
    // the associated details.
    emitDomain(sem_dom_key: string) {
        this.selectedDomain = this.semanticDomains[sem_dom_key];
        this.domainSelected.emit(this.selectedDomain);
        this.clearSearchResults();
        this.updateInputValue();
    }

    // Set the user's selection
    selectSuggestion(event: MouseEvent) {
        let value = (event.target as any).getAttribute('data-value');
        this.emitDomain(value);
    }

    // Clear the search results in preparation for a new query.
    clearSearchResults() {
        // TODO: Is this the right way to do this without leaking memory?
        // TODO Should clear results when the input loses focus.
        this.searchResults = [];
    }

    // Should we show the results list?
    showResults() {
        return this.searchResults.length > 0;
    }

    private semdomText() {
        return this.selectedDomain ?
                this.selectedDomain.name + ' ' + this.selectedDomain.key : '';
    }

    updateInputValue() {
        this.searchText.setValue(this.semdomText());
    }

    onInputBlur() {
        this.searchEnabled = false;
        this.updateInputValue();
    }

    onInputFocus() {
        this.searchText.setValue('');
        this.searchEnabled = true;
    }

}
