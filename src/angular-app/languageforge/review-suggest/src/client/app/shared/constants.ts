import { OpaqueToken } from '@angular/core';
import { Http } from '@angular/http';
import { LfApiService } from  './services/lf-api.service';

export namespace Constants {
    export module Api {
        export const API_SERVICE_FACTORY = (http: Http) => {
            return new LfApiService(http, 'http://m.languageforge.local');
        }
    }
}