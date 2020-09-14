import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JsonResult } from '../models/json-api.model';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JsonApiService {

  constructor(private readonly http: HttpClient) { }

  public call<T>(url: string): Observable<T> {
    return this.http
      .get<JsonResult<T>>(url)
      .pipe(map(res => { if (res.ok) { return res.data; } else { throw new Error(res.message); }}));
  }

  public head<T>(url: string): Observable<T> {
    return this.http.head<T>(url);
  }

  public exists<T>(url: string): Observable<boolean> {
    return this.http.head<T>(url).pipe(
      mapTo(true),
      catchError((err: HttpErrorResponse) => (err.status === 404) ? of(false) : throwError(err))
    );
  }

  public post<T>(url: string, body: any): Observable<T> {
    return this.http
      .post<JsonResult<T>>(url, body)
      .pipe(map(res => { if (res.ok) { return res.data; } else { throw new Error(res.message); }}));
  }

  public put<T>(url: string, body: any): Observable<T> {
    return this.http
      .put<JsonResult<T>>(url, body)
      .pipe(map(res => { if (res.ok) { return res.data; } else { throw new Error(res.message); }}));
  }

  public delete<T>(url: string): Observable<T> {
    return this.http
      .delete<JsonResult<T>>(url)
      .pipe(map(res => { if (res.ok) { return res.data; } else { throw new Error(res.message); }}));
  }

  public getProject<T>(projectCode): Observable<T> {
    return this.call<T>(`/api/projects/${projectCode}`);
  }

  public projectExists(projectCode): Observable<boolean> {
    return this.exists(`/api/projects/${projectCode}`);
  }

  public createUserExp<T>(body: any): Observable<T> {
    return this.post<T>('/api/experimental/users', body);
  }

  public addRemoveUserExp<T>(body: any): Observable<T> {
    return this.post<T>('/api/experimental/addRemoveUsers/test-ws-1-flex', body);
  }
  public addRemoveUserExpSample<T>(): Observable<T> {
    return this.call<T>('/api/experimental/addRemoveUsersSample');
  }
}
