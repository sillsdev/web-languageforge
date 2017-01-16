import {Component, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {SemanticDomain} from '../shared/models/semantic-domain.model';

const sem_doms = require('./sem-dom-data.js');

@Component({
    moduleId: module.id,
    selector: 'sem-dom-search',
    templateUrl: 'sem-dom-search.component.html'
})
export class SemanticDomainSearchComponent {
    @Output() domainSelected: EventEmitter<SemanticDomain> = new EventEmitter();

    searchResults: Array<SemanticDomain> = [];
    searchText: FormControl = new FormControl();

    constructor() {
        this.searchText.valueChanges
            .debounceTime(500)
            .distinctUntilChanged()
            .subscribe(search_text => {
                this.clearSearchResults();

                Object.keys(sem_doms).forEach((key: string) => {
                    let sem_dom: SemanticDomain = sem_doms[key];

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
        this.domainSelected.emit(sem_doms[sem_dom_key]);
    }

    // Clear the search results in preparation for a new query.
    clearSearchResults() {
        // TODO: Is this the right way to do this without leaking memory?
        this.searchResults = [];
    }

    // Should we show the results list?
    showResults() {
        return (this.searchText.value !== "" && this.searchResults.length > 0);
    }
}
