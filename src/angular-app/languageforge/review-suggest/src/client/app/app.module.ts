import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AboutModule } from './about/about.module';
import { HomeModule } from './home/home.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SharedModule } from './shared/shared.module';

import { MaterializeDirective } from 'angular2-materialize/dist/index';

@NgModule({
  imports: [BrowserModule, HttpModule, AppRoutingModule, AboutModule, HomeModule, DashboardModule, SharedModule.forRoot()],
  declarations: [AppComponent, MaterializeDirective],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '/app/review-suggest'
  }],
  bootstrap: [AppComponent]

})
export class AppModule { }
