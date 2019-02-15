import { MdcDialog, MdcDialogModule, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { QuestionService } from '../../core/question.service';
import { SFAdminAuthGuard } from '../../shared/sfadmin-auth.guard';
import { QuestionDialogComponent } from '../question-dialog/question-dialog.component';
import { CheckingOverviewComponent } from './checking-overview.component';

describe('CheckingOverviewComponent', () => {
  describe('Add Question', () => {
    it('should only display "Add question" button for admin', fakeAsync(() => {
      const env = new TestEnvironment();
      env.makeUserAProjectAdmin(false);
      expect(env.addQuestionButton).toBeNull();
      env.makeUserAProjectAdmin();
      expect(env.addQuestionButton).toBeDefined();
    }));

    it('should open dialog when "Add question" button is clicked', fakeAsync(() => {
      const env = new TestEnvironment();
      env.fixture.detectChanges();
      when(env.mockedMdcDialogRefForQDC.afterClosed()).thenReturn(of('close'));
      when(env.mockedMdcDialog.open(anything(), anything())).thenReturn(instance(env.mockedMdcDialogRefForQDC));
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      expect().nothing();
    }));

    it('should not add a question if cancelled', fakeAsync(() => {
      const env = new TestEnvironment();
      env.fixture.detectChanges();
      when(env.mockedMdcDialogRefForQDC.afterClosed()).thenReturn(of('close'));
      when(env.mockedMdcDialog.open(anything(), anything())).thenReturn(instance(env.mockedMdcDialogRefForQDC));
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedQuestionService.create(anything())).never();
      expect().nothing();
    }));

    it('should add a question if requested', fakeAsync(() => {
      const env = new TestEnvironment();
      env.fixture.detectChanges();
      when(env.mockedMdcDialogRefForQDC.afterClosed()).thenReturn(of(''));
      when(env.mockedMdcDialog.open(anything(), anything())).thenReturn(instance(env.mockedMdcDialogRefForQDC));
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedQuestionService.create(anything())).once();
      expect().nothing();
    }));
  });
});

@NgModule({
  imports: [FormsModule, MdcDialogModule, ReactiveFormsModule, NoopAnimationsModule, UICommonModule],
  exports: [QuestionDialogComponent],
  declarations: [QuestionDialogComponent],
  entryComponents: [QuestionDialogComponent]
})
class DialogTestModule {}

class TestEnvironment {
  component: CheckingOverviewComponent;
  fixture: ComponentFixture<CheckingOverviewComponent>;

  mockedActivatedRoute: ActivatedRoute = mock(ActivatedRoute);
  mockedMdcDialog: MdcDialog = mock(MdcDialog);
  mockedMdcDialogRefForQDC: MdcDialogRef<QuestionDialogComponent> = mock(MdcDialogRef);
  mockedSFAdminAuthGuard: SFAdminAuthGuard = mock(SFAdminAuthGuard);
  mockedUserService: UserService = mock(UserService);
  mockedQuestionService: QuestionService = mock(QuestionService);
  mockedAuthService: AuthService = mock(AuthService);
  overlayContainer: OverlayContainer;

  constructor() {
    when(this.mockedActivatedRoute.params).thenReturn(of({}));
    when(this.mockedSFAdminAuthGuard.allowTransition(anything())).thenReturn(of(true));

    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [CheckingOverviewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: MdcDialog, useFactory: () => instance(this.mockedMdcDialog) },
        { provide: SFAdminAuthGuard, useFactory: () => instance(this.mockedSFAdminAuthGuard) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: QuestionService, useFactory: () => instance(this.mockedQuestionService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) }
      ]
    });
    this.fixture = TestBed.createComponent(CheckingOverviewComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get addQuestionButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#add-question-button'));
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    flush();
  }

  makeUserAProjectAdmin(isProjectAdmin: boolean = true) {
    this.component.isProjectAdmin$ = of(isProjectAdmin);
  }
}
