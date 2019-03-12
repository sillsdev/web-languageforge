import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { FontSizeComponent } from './font-size.component';

describe('FontSizeComponent', () => {
  let env: TestEnvironment;

  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should create', () => {
    const template =
      '<app-font-size (apply)="applyFontChange($event)"></app-font-size><div #container>Lorem ipsum dolor sit .</div>';
    env.createHostComponent(template);
    expect(env.fixture.componentInstance).toBeTruthy();
  });

  it('can increase font', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.fontSize;
    env.clickButton(env.increaseButton);
    const newFontSize = env.fontSize;
    expect(newFontSize).toBeGreaterThan(fontSize);
  });

  it('can decrease font', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.fontSize;
    env.clickButton(env.increaseButton);
    let newFontSize = env.fontSize;
    expect(newFontSize).toBeGreaterThan(fontSize);
    env.clickButton(env.decreaseButton);
    newFontSize = env.fontSize;
    expect(newFontSize).toEqual(fontSize);
  });

  it('check disabled states', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.fontSize;
    expect(env.decreaseButton.nativeElement.disabled).toBe(true);
    for (let i: number = 0; i < 30; i++) {
      env.clickButton(env.increaseButton);
    }
    expect(env.decreaseButton.nativeElement.disabled).toBe(false);
    expect(env.increaseButton.nativeElement.disabled).toBe(true);
  });

  it('check min attribute - greater than default size', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)" [min]="2"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.fontSize;
    expect(fontSize).toBe(2);
    expect(env.decreaseButton.nativeElement.disabled).toBe(true);
  });

  it('check min attribute - less than default size', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)" [min]="0.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.fontSize;
    expect(fontSize).toBe(1);
    expect(env.decreaseButton.nativeElement.disabled).toBe(false);
  });

  it('check max attribute - greater than default size', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)" [max]="1.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    for (let i: number = 0; i < 5; i++) {
      env.clickButton(env.increaseButton);
    }
    const fontSize = env.fontSize;
    expect(fontSize).toBe(1.5);
    expect(env.increaseButton.nativeElement.disabled).toBe(true);
  });

  it('check max attribute - less than default size', () => {
    const template = `
      <app-font-size (apply)="applyFontChange($event)" [max]="0.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    expect(function() {
      env.createHostComponent(template);
    }).toThrow(new RangeError('min (1) can not be larger than max (0.5)'));
  });
});

@Component({ selector: 'app-host', template: '' })
class HostComponent {
  @ViewChild('container') container: ElementRef;

  applyFontChange($event: string) {
    this.container.nativeElement.style.fontSize = $event;
  }
}

class TestEnvironment {
  fixture: ComponentFixture<HostComponent>;

  constructor() {
    TestBed.configureTestingModule({
      declarations: [HostComponent, FontSizeComponent],
      imports: [UICommonModule]
    });
  }

  createHostComponent(template: string): void {
    TestBed.overrideComponent(HostComponent, { set: { template: template } });
    this.fixture = TestBed.createComponent(HostComponent);
    this.fixture.detectChanges();
  }

  clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  get increaseButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('button:last-child'));
  }

  get decreaseButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('button:first-child'));
  }

  get fontSize(): number {
    return parseFloat(this.fixture.debugElement.query(By.css('#container')).nativeElement.style.fontSize);
  }
}
