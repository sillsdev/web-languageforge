import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { AboutModule } from './about/about.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';
import { MultitextModule } from './multitext/multitext.module';

@NgModule({
  imports: [BrowserModule, HttpModule, AppRoutingModule, AboutModule, HomeModule, MultitextModule, SharedModule.forRoot()],
  declarations: [AppComponent],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '/app/rapid-words'
  }],
  bootstrap: [AppComponent]

})
export class AppModule { }
