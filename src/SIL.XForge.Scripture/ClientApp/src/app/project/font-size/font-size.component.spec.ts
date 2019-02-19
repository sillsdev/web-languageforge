import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DebugElement } from '@angular/core';
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
      '<app-font-size [container]="container"></app-font-size><div #container>Lorem ipsum dolor sit amet.</div>';
    env.createHostComponent(template);
    expect(env.fixture.componentInstance).toBeTruthy();
  });

  it('can increase font', () => {
    const template = `
      <app-font-size [container]="container"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    env.clickButton(env.getIncreaseButton());
    const newFontSize = env.getFontSize();
    expect(newFontSize).toBeGreaterThan(fontSize);
  });

  it('can decrease font', () => {
    const template = `
      <app-font-size [container]="container"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    env.clickButton(env.getIncreaseButton());
    let newFontSize = env.getFontSize();
    expect(newFontSize).toBeGreaterThan(fontSize);
    env.clickButton(env.getDecreaseButton());
    newFontSize = env.getFontSize();
    expect(newFontSize).toEqual(fontSize);
  });

  it('check disabled states', () => {
    const template = `
      <app-font-size [container]="container"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    expect(env.getDecreaseButton().nativeElement.disabled).toBeTruthy();
    for (let i: number = 0; i < 30; i++) {
      env.clickButton(env.getIncreaseButton());
    }
    expect(env.getDecreaseButton().nativeElement.disabled).toBeFalsy();
    expect(env.getIncreaseButton().nativeElement.disabled).toBeTruthy();
  });

  it('check min attribute - greater than default size', () => {
    const template = `
      <app-font-size [container]="container" [min]="2"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    expect(fontSize).toBe(2);
    expect(env.getDecreaseButton().nativeElement.disabled).toBe(true);
  });

  it('check min attribute - less than default size', () => {
    const template = `
      <app-font-size [container]="container" [min]="0.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    expect(fontSize).toBe(1);
    expect(env.getDecreaseButton().nativeElement.disabled).toBe(false);
  });

  it('check max attribute - greater than default size', () => {
    const template = `
      <app-font-size [container]="container" [max]="1.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    for (let i: number = 0; i < 5; i++) {
      env.clickButton(env.getIncreaseButton());
    }
    const fontSize = env.getFontSize();
    expect(fontSize).toBe(1.5);
    expect(env.getIncreaseButton().nativeElement.disabled).toBe(true);
  });

  it('check max attribute - less than default size', () => {
    const template = `
      <app-font-size [container]="container" [max]="0.5"></app-font-size>
      <div id="container" #container>Lorem ipsum dolor sit amet.</div>
    `;
    env.createHostComponent(template);
    const fontSize = env.getFontSize();
    expect(fontSize).toBe(1);
    expect(env.getIncreaseButton().nativeElement.disabled).toBe(true);
  });
});

@Component({ selector: 'app-host', template: '' })
class HostComponent {}

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

  getIncreaseButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('button[icon="add"]'));
  }

  getDecreaseButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('button[icon="remove"]'));
  }

  getFontSize(): number {
    return parseFloat(this.fixture.debugElement.query(By.css('#container')).nativeElement.style.fontSize);
  }
}
