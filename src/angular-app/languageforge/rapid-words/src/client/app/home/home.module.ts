import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';
import { MultitextModule } from '../multitext/multitext.module';

@NgModule({
  imports: [CommonModule, HomeRoutingModule, SharedModule, MultitextModule],
  declarations: [HomeComponent],
  exports: [HomeComponent],
  providers: [SemanticDomainListService]
})
export class HomeModule { }
