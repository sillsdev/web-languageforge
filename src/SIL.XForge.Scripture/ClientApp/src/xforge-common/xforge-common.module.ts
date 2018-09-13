import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';

import { JSONAPIService } from './json-api.service';

export function initApi(jsonApiService: JSONAPIService): () => Promise<void> {
  return () => jsonApiService.init();
}

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: [window.location.origin + '/api'],
        sendAccessToken: true
      }
    }),
  ],
  declarations: [],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initApi, deps: [JSONAPIService], multi: true }
  ]
})
export class XForgeCommonModule {}
