import { OpaqueToken } from '@angular/core';
import { Http } from '@angular/http';
import { LfApiService } from  './../shared/services/lf-api.service';

export namespace Constants {
    export module Api {
        export const API_SERVICE_FACTORY = (http: Http) => {
            return new LfApiService(http, 'http://languageforge.local');
        }
    }

    export module MultitextEntry {
        export const WORD_COMPONENT = 'Word';
        export const MEANING_COMPONENT = 'Meaning';
    }

    export module PaginationEntriesPerPage {
        export const ENTRIES_PER_PAGE = 8;
    }

    export module WordDetails {
        export const SAVE_BUTTON_TEXT_UPDATE = 'Update Entry';
        export const SAVE_BUTTON_TEXT_UPDATING = 'Updating...';
        export const SAVE_BUTTON_TEXT_SAVING = 'Saving...';
        export const SAVE_BUTTON_TEXT_SAVED = 'Entry Saved!';
        export const SAVE_BUTTON_TEXT_NEW = 'Add New Entry';
    }
}