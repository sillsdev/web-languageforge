import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  static uuid(): string {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, char => {
      // tslint:disable-next-line:no-bitwise
      const v = Math.random() * 16 | 0;
      return v.toString(16);
    });
  }
}
