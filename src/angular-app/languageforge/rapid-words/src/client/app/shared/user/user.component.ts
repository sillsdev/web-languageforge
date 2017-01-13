import { Component } from '@angular/core';
import { LfApiService } from '../services/lf-api.service';
import { Http } from '@angular/http';

import { OnInit } from '@angular/core';

let lfApiServiceFactory = (http: Http) => {
    return new LfApiService(http, 'http://languageforge.local');
}

@Component({
  moduleId: module.id,
  selector: 'user-component',
  templateUrl: 'user.component.html',
  providers: [{
      provide: LfApiService,
      useFactory: lfApiServiceFactory,
      deps: [Http]
  }]
})
export class UserComponent implements OnInit {

    username: string;

    ngOnInit(): void {
        this.updateProjectList();
    }

    constructor(private lfApi: LfApiService) { }

    updateProjectList(){
        this.lfApi.getUserProfile().subscribe(res => {
            if(res.success) {
                this.username = res.data.name;
            }
            else console.error(res);
        })
    }
}
