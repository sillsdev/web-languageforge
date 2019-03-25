import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ElementState } from 'xforge-common/models/element-state';

@Component({
  selector: 'app-write-status',
  templateUrl: './write-status.component.html',
  styleUrls: ['./write-status.component.scss']
})
export class WriteStatusComponent {
  @Input() state: ElementState;
  @Input() formGroup: FormGroup;

  ElementState = ElementState;
}
