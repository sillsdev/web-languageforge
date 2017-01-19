import { NgModule, OpaqueToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { AppComponent } from './app.component';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { MultitextModule } from './multitext/multitext.module';
import { LfApiService } from './shared/services/lf-api.service';
import { Constants } from './shared/constants';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        HomeModule,
        MultitextModule,
        SharedModule.forRoot(),
    ],
    declarations: [AppComponent],
    providers: [{
        provide: APP_BASE_HREF,
        useValue: '/app/rapid-words'
    },
    {
      provide: LfApiService,
      useFactory: Constants.Api.API_SERVICE_FACTORY,
      deps: [Http]
    }
  ],
    bootstrap: [AppComponent]
})
export class AppModule { }
