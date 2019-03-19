import {
  MDC_DIALOG_DATA,
  MdcDialog,
  MdcDialogConfig,
  MdcDialogModule,
  MdcDialogRef,
  OverlayContainer
} from '@angular-mdc/web';
import { HttpClientModule } from '@angular/common/http';
import { Component, DebugElement, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, flush, inject } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { BrowserModule, By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { mock } from 'ts-mockito';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { VerseRefData } from '../core/models/verse-ref-data';
import { ScriptureChooserDialogComponent } from './scripture-chooser-dialog.component';

describe('ScriptureChooserDialog', () => {
  let dialog: MdcDialog;
  let overlayContainer: OverlayContainer;
  let viewContainerFixture: ComponentFixture<ChildViewContainerComponent>;
  let testViewContainerRef: ViewContainerRef;
  let env: TestEnvironment;

  it('initially shows book chooser, close button', () => {
    env = new TestEnvironment();
    expect(env.dialogText).toContain('X');
    expect(env.dialogText).toContain('book');
    expect(env.dialogText).toContain('MAT');
  });

  it('clicking book goes to chapter chooser, shows back button', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookEphesians);
    expect(env.reference.trim()).toEqual('EPH');
    expect(env.dialogText).not.toContain('X');
    expect(env.dialogText).not.toContain('book');
    expect(env.dialogText).not.toContain('MAT');
    expect(env.dialogText).toContain(env.backIconName);
    expect(env.dialogText).toContain('chapter');
    expect(env.chapter3).not.toBeUndefined('missing chapter 3 button');
  }));

  it('clicking book goes to verse chooser, shows back button', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookEphesians);
    env.click(env.chapter3);
    expect(env.reference).toEqual('EPH 3');
    expect(env.dialogText).not.toContain('X');
    expect(env.dialogText).not.toContain('book');
    expect(env.dialogText).not.toContain('MAT');
    expect(env.dialogText).not.toContain('chapter');
    expect(env.dialogText).toContain(env.backIconName);
    expect(env.verse21).not.toBeUndefined('missing verse 21 button');
  }));

  it('clicking verse closes and reports selection', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookEphesians);
    env.click(env.chapter3);
    env.click(env.verse21);
    expect(env.afterCloseCallback).toHaveBeenCalledWith({ book: 'EPH', chapter: '3', verse: '21' });
  }));

  it('clicking X closes. dialog reports cancelled via null result.', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.backoutButton);
    expect(env.afterCloseCallback).toHaveBeenCalledWith(null);
  }));

  it('clicking back at chapter selection goes to book selection', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookEphesians);
    env.click(env.backoutButton);
    expect(env.dialogText).toContain('X');
    expect(env.dialogText).toContain('book');
    expect(env.dialogText).toContain('MAT');
  }));

  it('clicking back at verse selection goes to chapter selection', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookEphesians);
    env.click(env.chapter3);
    env.click(env.backoutButton);
    expect(env.dialogText).toContain(env.backIconName);
    expect(env.dialogText).toContain('chapter');
    expect(env.chapter3).not.toBeUndefined('missing chapter 3 button');
  }));

  it('book not highlighted, if no (null) incoming reference', fakeAsync(() => {
    env = new TestEnvironment(null);
    expect(env.highlightedButton).toBeNull();
  }));

  it('book not highlighted, if no (omitted) incoming reference', fakeAsync(() => {
    env = new TestEnvironment();
    expect(env.highlightedButton).toBeNull();
  }));

  it('book highlighted', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.fixture.detectChanges();
    expect(env.highlightedButton).not.toBeNull();
  }));

  it('chapter not highlighted, if no incoming reference', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookRomans);
    expect(env.highlightedButton).toBeNull();
  }));

  it('chapter highlighted, if showing incoming book reference', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.click(env.bookRomans);
    expect(env.highlightedButton).not.toBeNull();
  }));

  it('chapter not highlighted if not in right book', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.click(env.bookEphesians);
    expect(env.highlightedButton).toBeNull();
  }));

  it('verse not highlighted, if no incoming reference', fakeAsync(() => {
    env = new TestEnvironment();
    env.click(env.bookRomans);
    env.click(env.chapter11);
    expect(env.highlightedButton).toBeNull();
  }));

  it('verse highlighted, if showing incoming book and chapter reference', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.click(env.bookRomans);
    env.click(env.chapter11);
    expect(env.highlightedButton).not.toBeNull();
  }));

  it('verse not highlighted if in right book but wrong chapter', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.click(env.bookRomans);
    env.click(env.chapter3);
    expect(env.highlightedButton).toBeNull();
  }));

  it('verse not highlighted if in right chapter number but wrong book', fakeAsync(() => {
    env = new TestEnvironment({ book: 'ROM', chapter: '11', verse: '33' });
    env.click(env.bookEphesians);
    env.click(env.chapter11);
    expect(env.highlightedButton).toBeNull();
  }));

  it('input is received', fakeAsync(() => {
    env = new TestEnvironment({ book: 'EPH', chapter: '7', verse: '9' });
    expect(env.component.input.book).toEqual('EPH');
    expect(env.component.input.chapter).toEqual('7');
    expect(env.component.input.verse).toEqual('9');
  }));

  it('input can omit verse', fakeAsync(() => {
    env = new TestEnvironment({ book: 'EPH', chapter: '7' });
    expect(env.component.input.book).toEqual('EPH');
    expect(env.component.input.chapter).toEqual('7');
    expect(env.component.input.verse).toBeUndefined();
  }));

  it('input can omit chapter and verse', fakeAsync(() => {
    env = new TestEnvironment({ book: 'EPH' });
    expect(env.component.input.book).toEqual('EPH');
    expect(env.component.input.chapter).toBeUndefined();
    expect(env.component.input.verse).toBeUndefined();
  }));

  it('dialog only shows books, chapters, verses that are in project', fakeAsync(() => {
    // TODO
  }));

  @Directive({
    // ts lint complains that a directive should be used as an attribute
    // tslint:disable-next-line:directive-selector
    selector: 'viewContainerDirective'
  })
  class ViewContainerDirective {
    constructor(public viewContainerRef: ViewContainerRef) {}
  }

  @Component({
    selector: 'app-view-container',
    template: '<viewContainerDirective></viewContainerDirective>'
  })
  class ChildViewContainerComponent {
    @ViewChild(ViewContainerDirective) viewContainer: ViewContainerDirective;

    get childViewContainer(): ViewContainerRef {
      return this.viewContainer.viewContainerRef;
    }
  }

  @NgModule({
    imports: [
      BrowserModule,
      FormsModule,
      HttpClientModule,
      MatSnackBarModule,
      ReactiveFormsModule,
      RouterTestingModule,
      UICommonModule,
      MdcDialogModule
    ],
    declarations: [ViewContainerDirective, ChildViewContainerComponent, ScriptureChooserDialogComponent],
    exports: [ViewContainerDirective, ChildViewContainerComponent, ScriptureChooserDialogComponent],
    entryComponents: [ChildViewContainerComponent, ScriptureChooserDialogComponent]
  })
  class TestModule {}

  class TestEnvironment {
    fixture: ComponentFixture<ChildViewContainerComponent>;
    component: ScriptureChooserDialogComponent;
    dialogRef: MdcDialogRef<ScriptureChooserDialogComponent>;
    overlayContainerElement: HTMLElement;
    afterCloseCallback: jasmine.Spy;
    closeIconName = 'close';
    backIconName = 'arrow_back';

    constructor(inputScriptureReference?: VerseRefData) {
      this.afterCloseCallback = jasmine.createSpy('afterClose callback');
      const config: MdcDialogConfig<VerseRefData> = {
        scrollable: true,
        viewContainerRef: testViewContainerRef,
        data: inputScriptureReference
      };
      this.dialogRef = dialog.open(ScriptureChooserDialogComponent, config);
      this.dialogRef.afterClosed().subscribe(this.afterCloseCallback);
      this.component = this.dialogRef.componentInstance;
      this.overlayContainerElement = overlayContainer.getContainerElement();
      this.fixture = viewContainerFixture;
      this.fixture.detectChanges();
    }

    get dialogText(): string {
      return this.overlayContainerElement.textContent;
    }

    get bookEphesians(): DebugElement {
      return this.buttonWithText('EPH');
    }

    get bookRomans(): DebugElement {
      return this.buttonWithText('ROM');
    }

    get chapter3(): DebugElement {
      return this.buttonWithText('3');
    }

    get chapter11(): DebugElement {
      return this.buttonWithText('11');
    }

    get verse21(): DebugElement {
      return this.buttonWithText('21');
    }

    get verse33(): DebugElement {
      return this.buttonWithText('33');
    }

    get reference(): string {
      return this.fixture.debugElement.query(By.css('.reference')).nativeElement.textContent;
    }

    get backoutButton(): DebugElement {
      return this.fixture.debugElement.query(By.css('#backout-button'));
    }

    get highlightedButton(): DebugElement {
      return this.fixture.debugElement.query(By.css('.ngx-mdc-button--primary'));
    }

    click(element: DebugElement): void {
      element.nativeElement.click();
      this.fixture.detectChanges();
      flush();
    }

    buttonWithText(text: string): DebugElement {
      return this.fixture.debugElement
        .queryAll(By.css('button'))
        .find(button => button.nativeElement.innerText === text);
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [{ provide: MDC_DIALOG_DATA }]
    }).compileComponents();
  }));

  beforeEach(inject([MdcDialog, OverlayContainer], (d: MdcDialog, oc: OverlayContainer) => {
    dialog = d;
    overlayContainer = oc;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ChildViewContainerComponent);
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
});
