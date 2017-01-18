import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule, Http } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { ReviewModule } from './review/review.module'
import { TestServicesModule } from './test-services/test-services.module';
import { SharedModule } from './shared/shared.module';
import { MaterializeModule } from './shared/materialize.module';

import { LfApiService } from './shared/services/lf-api.service';
import { ProjectService } from './shared/services/project.service';

import { Constants } from './shared/constants';

import { LoggedInGuard } from './shared/logged-in.guard';

@NgModule({
  imports: [BrowserModule, 
  HttpModule, 
  AppRoutingModule, 
  DashboardModule, 
  AuthModule, 
  TestServicesModule, 
  SharedModule.forRoot(), 
  MaterializeModule, 
  ReviewModule],
  declarations: [AppComponent],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '/app/review-suggest'
  },
  {
    provide: LfApiService,
    useFactory: Constants.Api.API_SERVICE_FACTORY,
    deps: [Http]
  },
  LoggedInGuard,
  ProjectService],
  bootstrap: [AppComponent]

})
export class AppModule { }
