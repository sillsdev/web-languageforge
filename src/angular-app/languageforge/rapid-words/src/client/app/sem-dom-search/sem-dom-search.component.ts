import {Component, Output, EventEmitter} from '@angular/core';
import {FormControl} from '@angular/forms';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {SemanticDomain} from '../shared/models/semantic-domain.model';

//const sem_doms = require('sem-dom-data.js'); // TODO Turn this into a value service CP 2017-01
const sem_doms: any = {
    "1" : {
        "guid" : "63403699-07c1-43f3-a47c-069d6e4316e5",
        "key" : "1",
        "abbr" : "1",
        "name" : "Universe, creation",
        "description" : "Use this domain for general words referring to the physical universe. Some languages may not have a single word for the universe and may have to use a phrase such as 'rain, soil, and things of the sky' or 'sky, land, and water' or a descriptive phrase such as 'everything you can see' or 'everything that exists'.",
        "value" : "1 Universe, creation"
    },
    "1.1" : {
        "guid" : "999581c4-1611-4acb-ae1b-5e6c1dfe6f0c",
        "key" : "1.1",
        "abbr" : "1.1",
        "name" : "Sky",
        "description" : "Use this domain for words related to the sky.",
        "value" : "1.1 Sky"
    }
};

@Component({
    moduleId: module.id,
    selector: 'sem-dom-search',
    templateUrl: 'sem-dom-search.component.html'
})
export class SemanticDomainSearchComponent {
    @Output() domainSelected: EventEmitter<SemanticDomain> = new EventEmitter();

    searchText: FormControl = new FormControl();
    searchResults: Array<SemanticDomain> = [];

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
        this.clearSearchResults();
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
