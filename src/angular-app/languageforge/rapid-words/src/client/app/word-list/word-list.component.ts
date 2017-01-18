import { Component, Input } from '@angular/core'
import { Http } from '@angular/http';

import { LfApiService } from '../shared/services/lf-api.service';
import { LexEntry } from '../shared/models/lex-entry';

@Component({
  moduleId: module.id,
  selector: 'word-list',
  templateUrl: 'word-list.component.html',
  styleUrls: ['word-list.component.css']
})

export class WordListComponent {
    @Input() entries: LexEntry[];

    constructor() {
    }

    /**
     * Because of the nature of lexemes having multiple keys representing different languages,
     * here we get a preview word for the word list using whatever the first one is that we can grab.
     */
    getPreviewWord(entry: LexEntry) {
        let word = entry.lexeme[Object.keys(entry.lexeme)[0]].value;

        if (word == '') {
            return '[Empty]';
        }
        return word;
    }

    /**
     * Same as getPreviewWord(), just a little more verbose because of words without definitions and
     * the fact that the definition is a level deeper than the word.
     */
    getPreviewDefinition(entry: LexEntry) {
        let firstSenseDefinition = entry.senses[0].definition;
        if (Object.keys(firstSenseDefinition).length > 0) {
            let definition = firstSenseDefinition[Object.keys(firstSenseDefinition)[0]].value;
            if (definition == '') {
                return '[Empty]';
            }
            return firstSenseDefinition[Object.keys(firstSenseDefinition)[0]].value;
        } else {
            return '[Empty]';
        }
    }
}