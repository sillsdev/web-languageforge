import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../models/user';
import { USER } from '../mock-data/mock-user';

@Injectable()
export class AuthService {

  constructor(public router: Router) {}

  getUsers(): Promise<User[]> {
    return Promise.resolve(USER);
  }

  getUserAccount(user: User): Promise<User> {
    let elementPos = USER.map(function(x) {return x.email; }).indexOf(user.email);
    let objectFound = USER[elementPos];
    return Promise.resolve(objectFound);
  }

  login(user: User): Promise<any> {
    let elementPos = USER.map(function(x) {return x.email; }).indexOf(user.email);
    let dbUser = USER[elementPos];
      if(dbUser){  
        if(user.password == dbUser.password){
          //TODO: get cookie from http request
          //TODO: store cookie in local storage
          return Promise.resolve(dbUser);
        }
      }
      return Promise.resolve(false);;
  }

  logout(){
    //TODO: remove cookie from local storage
    this.router.navigate(['auth']);
  }
}