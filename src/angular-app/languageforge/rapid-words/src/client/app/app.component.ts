import { Component } from '@angular/core';
import { Config } from './shared/config/env.config';
import './operators';

@Component({
  moduleId: module.id,
  selector: 'sd-app',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  constructor() {
  }
}
