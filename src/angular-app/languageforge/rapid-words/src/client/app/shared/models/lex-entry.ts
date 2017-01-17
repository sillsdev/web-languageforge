export class LexSense {
    guid: string;

    /**
     * This is an object containing key-value pairs where the key is the
     * language code and the value is another object containing a single
     * key-value pair where the key is "value" and that key's value is 
     * a string containing the definition.
     * Ex:
     * "definition": {
     *     "en": {
     *          "value": "ut"
     *      }
     *  }
     */
    definition: any;

    /**
     * This is an object containing a single key-value pair, where the key
     * is "values" and the value is an array containing semantic domain strings.
     */
    semanticDomain: any;

    constructor(jsonSense: any = null) {
        if (jsonSense) {
            this.guid = jsonSense.guid;
            this.definition = jsonSense.definition;
            this.semanticDomain = jsonSense.semanticDomain;
        } else {
            this.guid = '';
            this.definition = {};
            this.semanticDomain = {};
        }
    }

    static mapSensesResponse(senses: any[]) {
        var arrayOfLexSenses: any = [];
        if (senses) {
            for (let sense of senses) {
                arrayOfLexSenses.push(new LexSense(sense));
            }
        } else {
            arrayOfLexSenses.push(new LexSense());
        }
        return arrayOfLexSenses;
    }
}

/**
 * This is a model for entries received from the backend + some convenience methods that help with 
 * displaying the words and definitions.
 */
export class LexEntry {
    id: string;
    isDeleted: boolean;

    /**
     * LexEntry.lexeme is essentially the same as LexSense.definition.
     */
    lexeme: any;
    senses: LexSense[];

    constructor(jsonResponse: any = null) {
        if (jsonResponse) {
            this.id = jsonResponse.id;
            this.isDeleted = jsonResponse.isDeleted;
            this.lexeme = jsonResponse.lexeme;
            this.senses = LexSense.mapSensesResponse(jsonResponse.senses);
        } else {
            this.id = '';
            this.isDeleted = false;
            this.lexeme = {};
            this.senses = [];
        }
    }

    asJsonObject() {
        return {
            id: this.id,
            lexeme: this.lexeme,
            isDeleted: this.isDeleted,
            senses: this.senses
        }
    }

    static mapEntriesResponse(entries: any[]) {
        var arrayOfLexEntries: any = [];
        for (let entry of entries) {
            arrayOfLexEntries.push(new LexEntry(entry));
        }
        return arrayOfLexEntries;
    }
}