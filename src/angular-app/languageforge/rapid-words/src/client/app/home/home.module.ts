import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import { WordListComponent } from '../word-list/word-list.component';
import {HomeRoutingModule} from './home-routing.module';
import {SharedModule} from '../shared/shared.module';
import {MultitextModule} from '../multitext/multitext.module';
import {WordDetailsModule} from '../word-details/word-details.module';
import {SemanticDomainSearchModule} from "../sem-dom-search/sem-dom-search.module";

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        SharedModule,
        MultitextModule,
        WordDetailsModule,
        SemanticDomainSearchModule],
    declarations: [HomeComponent, WordListComponent],
    exports: [HomeComponent]
})
export class HomeModule {
}
