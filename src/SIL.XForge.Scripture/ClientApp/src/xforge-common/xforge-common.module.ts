import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';

import { ApiService } from './api.service';

export function initApi(apiService: ApiService): () => Promise<void> {
  return () => apiService.init();
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
    { provide: APP_INITIALIZER, useFactory: initApi, deps: [ApiService], multi: true }
  ]
})
export class XForgeCommonModule {}
