import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthService } from '../shared/services/auth.service';

@NgModule({
  imports: [CommonModule, AuthRoutingModule, FormsModule],
  declarations: [AuthComponent],
  exports: [AuthComponent],
  providers: [AuthService]
})
export class AuthModule { }