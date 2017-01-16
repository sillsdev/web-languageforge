import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {SemanticDomainSearchComponent} from './sem-dom-search.component';
import {SemanticDomainDataService} from './sem-dom-data.service';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [SemanticDomainSearchComponent],
    exports: [SemanticDomainSearchComponent],
    providers: [SemanticDomainDataService]
})
export class SemanticDomainSearchModule {}
