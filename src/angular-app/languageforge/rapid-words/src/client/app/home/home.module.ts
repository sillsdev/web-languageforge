import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { WordListComponent } from '../word-list/word-list.component';
import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../shared/shared.module';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';
import { MultitextModule } from '../multitext/multitext.module';
import { WordDetailsModule } from '../word-details/word-details.module';

@NgModule({
  imports: [CommonModule, HomeRoutingModule, SharedModule, MultitextModule, WordDetailsModule],
  declarations: [HomeComponent, WordListComponent],
  exports: [HomeComponent],
  providers: [SemanticDomainListService]
})
export class HomeModule { }
