import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-font-size',
  templateUrl: './font-size.component.html',
  styleUrls: ['./font-size.component.scss']
})
export class FontSizeComponent implements OnInit {
  @Input() container: HTMLElement;
  @Input() min: number = 1;
  @Input() max: number = 3;
  fontSize: number = 1;

  constructor() {}

  ngOnInit(): void {
    if (this.fontSize <= this.min) {
      this.fontSize = this.min;
    }
    if (this.fontSize > this.max) {
      this.max = this.fontSize;
    }
    this.apply();
  }

  apply() {
    this.container.style.fontSize = this.fontSize + 'rem';
  }

  increaseFontSize() {
    this.fontSize = this.fontSize + 0.1;
    if (this.fontSize > this.max) {
      this.fontSize = this.max;
    }
    this.apply();
  }

  decreaseFontSize() {
    this.fontSize = this.fontSize - 0.1;
    if (this.fontSize < this.min) {
      this.fontSize = this.min;
    }
    this.apply();
  }
}
