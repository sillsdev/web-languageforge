import { Injectable } from '@angular/core';

import { Response, Headers, Http, RequestOptions, RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class LfApiService {
    private apiUrl: string;

    constructor(private http: Http, private baseApiUrl: string) {
        this.apiUrl = baseApiUrl + '/api/sf';
    }

    /**
     * Sends a POST request to the given url with the given body.
     * @returns An Observable<Response> for the request.
     */
    private sendRequest(url: string, body: any) {
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, body, options);
    }

    /**
     * Calls the API with the given method and optional parameters.
     * @returns An Observable<Object> where thet object has properties success,
     * data, and message.
     * success tells if the request was successful, that is, that the HTTP
     * response code was in the 2xx range, and that the API did not indicate
     * any error.
     * data is the response from the API. If success is true it is the result
     * property of the API's response. If success is false it is the entire
     * body of the response, which has an error property.
     * message exists only if success is false. If the HTTP status code is not
     * in the 2xx range it tells what the error was
     * (e.g. "Error 404 (Not found)"). In the case of an API error it is just
     * "API error".
     */
    private callApi(method: string, params?: any[]) {
        let body = {
            version: "2.0",
            method: method,
            params: params || [],
            // TODO determine whether id needs to be incremented
            id: 1
        };

        return this.sendRequest(this.apiUrl, body)
        .map(res => {
            let data = res.ok ? res.json() : null;
            let success = res.ok && !data.error;
            let message: string;
            if(!res.ok) message = `Error ${res.status} ({res.statusText})`;
            else if(data.error) {
                message = 'API error'
                console.error(`API error:\n` +
                    `Type: ${data.error.type}\n` +
                    `${data.error.message}`
                );
            }
            else data = data.result;

            return {success, data, message}
       });
    }

    /**
     * Fetches the user's profile and returns an Observable<Object> where
     * object.data has the user profile information (name, username, etc.).
     * For other properties (success and message) see
     * {@link LfApiService#callApi}
     */
    getUserProfile() {
        return this.callApi('user_readProfile').map(result => {
            result.data = result.data.userProfile;
            return result;
        });
    }

    getFullDbeDto() {
        return this.callApi('lex_dbeDtoFull', [1, 0]).map(result => {
            return result;
        });
    }
}
