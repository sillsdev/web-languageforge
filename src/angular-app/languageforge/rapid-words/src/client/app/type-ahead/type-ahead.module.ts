import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms'
import {TypeAheadComponent} from './type-ahead.component';

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [TypeAheadComponent],
    exports: [TypeAheadComponent]
})
export class TypeAheadModule {}
