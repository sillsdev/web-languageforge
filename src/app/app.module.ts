import {Inject, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {UpgradeModule} from '@angular/upgrade/static';
import 'zone.js';

interface AppWindow extends Window {
  appName: string;
}

@NgModule({
  imports: [
    BrowserModule,
    UpgradeModule
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
