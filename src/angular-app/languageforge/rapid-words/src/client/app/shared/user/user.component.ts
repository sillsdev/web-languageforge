import { Component } from '@angular/core';
import { LfApiService } from '../services/lf-api.service';
import { Http } from '@angular/http';

import { OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'user-component',
  templateUrl: 'user.component.html'
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
