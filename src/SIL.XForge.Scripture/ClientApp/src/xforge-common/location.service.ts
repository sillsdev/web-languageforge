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

  get hostname(): string {
    return window.location.hostname;
  }

  get pathname(): string {
    return window.location.pathname;
  }

  go(url: string): void {
    window.location.href = url;
  }
}
