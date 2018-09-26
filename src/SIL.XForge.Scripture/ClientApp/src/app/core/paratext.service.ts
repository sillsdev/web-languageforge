import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UserService } from '@xforge-common/user.service';
import { ParatextProject } from '../shared/models/paratext-project';

@Injectable({
  providedIn: 'root'
})
export class ParatextService {
  constructor(private readonly http: HttpClient, private readonly userService: UserService) { }

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
