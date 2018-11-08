import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  get href(): string {
    return window.location.href;
  }

  get origin(): string {
    return window.location.origin;
  }

  get protocol(): string {
    return window.location.protocol;
  }

  get host(): string {
    return window.location.host;
  }

  go(url: string): void {
    window.location.href = url;
  }
}
