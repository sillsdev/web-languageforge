import {Inject, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import 'zone.js';
import { CaptchaComponent } from '../angular-app/bellows/shared/captcha.component';

interface AppWindow extends Window {
  appName: string;
}

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule,
    FormsModule,
    NgbModule
  ],
  entryComponents: [
    CaptchaComponent
  ],
  declarations: [
    CaptchaComponent
  ],
  providers: [
    { provide: 'APP_NAME', useFactory: getAppName }
  ]
})
export class AppModule {
  constructor(@Inject(UpgradeModule) private upgrade: UpgradeModule, @Inject('APP_NAME') private appName: string) { }

  // noinspection JSUnusedGlobalSymbols
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [this.appName], { strictDi: true });
  }
}

export function getAppName() {
  return (typeof window !== 'undefined' && (window as AppWindow & typeof globalThis).appName != null)
    ? (window as AppWindow & typeof globalThis).appName
    : null;
}
