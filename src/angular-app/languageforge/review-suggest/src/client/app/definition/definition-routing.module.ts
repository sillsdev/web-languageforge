import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DefinitionComponent } from './definition.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'definition', component: DefinitionComponent }
    ])
  ],
  exports: [RouterModule]
})
export class DefinitionRoutingModule { }