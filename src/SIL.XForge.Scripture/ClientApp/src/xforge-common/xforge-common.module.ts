import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['api'],
        sendAccessToken: true
      }
    }),
  ],
  declarations: []
})
export class XForgeCommonModule {}
