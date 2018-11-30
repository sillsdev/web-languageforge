import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '@xforge-common/auth.service';
import { ParatextProject } from './models/paratext-project';

@Injectable({
  providedIn: 'root'
})
export class ParatextService {
  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  logIn(returnUrl: string): void {
    const url =
      '/external/challenge?provider=Paratext&returnUrl=' + returnUrl + '&userId=' + this.authService.currentUserId;
    document.location.href = url;
  }

  getProjects(): Observable<ParatextProject[]> {
    return this.http.get<ParatextProject[]>('paratext-api/projects', { headers: this.getHeaders() });
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.authService.accessToken
    });
  }
}
