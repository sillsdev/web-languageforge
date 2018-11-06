import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ParatextProject } from './models/paratext-project';
import { SFUserService } from './sfuser.service';

@Injectable({
  providedIn: 'root'
})
export class ParatextService {
  constructor(private readonly http: HttpClient, private readonly userService: SFUserService) { }

  logIn(returnUrl: string): void {
    const url = '/external/challenge?provider=Paratext&returnUrl=' + returnUrl + '&userId='
      + this.userService.currentUserId;
    document.location.href = url;
  }

  getProjects(): Observable<ParatextProject[]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.get<ParatextProject[]>('api/paratext/projects', { headers });
  }
}
