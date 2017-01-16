import { OpaqueToken } from '@angular/core';
import { Http } from '@angular/http';
import { LfApiService } from  './../../../../../js/services/lf-api.service';

export namespace Constants {
    export module Api {
        export const API_SERVICE_FACTORY = (http: Http) => {
            return new LfApiService(http, 'http://languageforge.local');
        }
    }
}