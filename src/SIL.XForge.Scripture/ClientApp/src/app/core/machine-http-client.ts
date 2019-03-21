import { HttpClient as AngularHttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@sillsdev/machine';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const MACHINE_API_BASE_URL = 'machine-api/';

@Injectable({
  providedIn: 'root'
})
export class MachineHttpClient extends HttpClient {
  constructor(private readonly httpClient: AngularHttpClient) {
    super();
  }

  get<T>(url: string): Observable<HttpResponse<T>> {
    return this.httpClient
      .get<T>(MACHINE_API_BASE_URL + url, { headers: this.getHeaders(), observe: 'response' })
      .pipe(map(r => ({ status: r.status, data: r.body })));
  }

  post<T>(url: string, body?: any): Observable<HttpResponse<T>> {
    return this.httpClient
      .post<T>(MACHINE_API_BASE_URL + url, body, { headers: this.getHeaders(), observe: 'response' })
      .pipe(map(r => ({ status: r.status, data: r.body })));
  }
}
