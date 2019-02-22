import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-font-size',
  templateUrl: './font-size.component.html',
  styleUrls: ['./font-size.component.scss']
})
export class FontSizeComponent implements OnInit {
  @Input() min: number = 1;
  @Input() max: number = 3;
  @Output() apply: EventEmitter<string> = new EventEmitter<string>();
  fontSize: number = 1;

  constructor() {}

  ngOnInit(): void {
    if (this.fontSize < this.min) {
      this.fontSize = this.min;
    }
    if (this.min > this.max) {
      throw new RangeError('min (' + this.min + ') can not be larger than max (' + this.max + ')');
    } else if (this.max < this.fontSize) {
      throw new RangeError('max (' + this.max + ') can not be less than font size (' + this.fontSize + ')');
    } else {
      this.applySize();
    }
  }

  applySize() {
    this.apply.emit(this.fontSize + 'rem');
  }

  decreaseFontSize() {
    this.fontSize = this.fontSize - 0.1;
    if (this.fontSize < this.min) {
      this.fontSize = this.min;
    }
    this.applySize();
  }

  increaseFontSize() {
    this.fontSize = this.fontSize + 0.1;
    if (this.fontSize > this.max) {
      this.fontSize = this.max;
    }
    this.applySize();
  }
}
