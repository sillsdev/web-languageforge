import { MdcDialog, MdcDialogModule, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito';
import { AuthService } from 'xforge-common/auth.service';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { Question } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { Text } from '../../core/models/text';
import { QuestionService } from '../../core/question.service';
import { SFProjectService } from '../../core/sfproject.service';
import { MockRealtimeDoc } from '../../shared/models/mock-realtime-doc';
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
      when(env.mockedQuestionDialogRef.afterClosed()).thenReturn(of('close'));
      env.fixture.detectChanges();
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      expect().nothing();
    }));

    it('should not add a question if cancelled', fakeAsync(() => {
      const env = new TestEnvironment();
      when(env.mockedQuestionDialogRef.afterClosed()).thenReturn(of('close'));
      env.fixture.detectChanges();
      flush();
      verify(env.mockedQuestionService.connect(anything())).twice();

      resetCalls(env.mockedQuestionService);
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedQuestionService.connect(anything())).never();
      expect().nothing();
    }));

    it('should add a question if requested', fakeAsync(() => {
      const env = new TestEnvironment();
      when(env.mockedQuestionDialogRef.afterClosed()).thenReturn(
        of({
          scriptureStart: 'MAT 3:3',
          scriptureEnd: '',
          text: ''
        })
      );
      env.fixture.detectChanges();
      flush();
      verify(env.mockedQuestionService.connect(anything())).twice();

      resetCalls(env.mockedQuestionService);
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedQuestionService.connect(anything())).once();
      expect().nothing();
    }));

    it('should expand/collapse questions in book text', fakeAsync(() => {
      const env = new TestEnvironment();
      env.waitForQuestions();
      expect(env.textRows.length).toEqual(2);
      expect(env.questionEdits.length).toEqual(0);
      expect(env.component.itemVisible['text01']).toBeFalsy();
      expect(env.component.questions['text01'].data.length).toBeGreaterThan(0);
      expect(env.component.questionCount('text01')).toBeGreaterThan(0);

      env.simulateRowClick(0);
      expect(env.textRows.length).toEqual(4);
      expect(env.questionEdits.length).toEqual(2);

      env.simulateRowClick(0);
      expect(env.textRows.length).toEqual(2);
      expect(env.questionEdits.length).toEqual(0);
    }));

    it('should edit question', fakeAsync(() => {
      const env = new TestEnvironment();
      when(env.mockedQuestionDialogRef.afterClosed()).thenReturn(
        of({
          scriptureStart: 'MAT 3:3',
          scriptureEnd: '',
          text: ''
        })
      );
      env.waitForQuestions();
      env.simulateRowClick(0);
      expect(env.textRows.length).toEqual(4);
      expect(env.questionEdits.length).toEqual(2);
      verify(env.mockedQuestionService.connect(anything())).twice();

      resetCalls(env.mockedQuestionService);
      env.clickElement(env.questionEdits[0]);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedQuestionService.connect(anything())).never();
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
  mockedSFAdminAuthGuard: SFAdminAuthGuard = mock(SFAdminAuthGuard);
  mockedMdcDialog: MdcDialog = mock(MdcDialog);
  mockedQuestionDialogRef: MdcDialogRef<QuestionDialogComponent> = mock(MdcDialogRef);
  mockedNoticeService = mock(NoticeService);
  mockedProjectService: SFProjectService = mock(SFProjectService);
  mockedQuestionService: QuestionService = mock(QuestionService);
  mockedUserService: UserService = mock(UserService);
  mockedAuthService: AuthService = mock(AuthService);
  mockedRealtimeOfflineStore: RealtimeOfflineStore = mock(RealtimeOfflineStore);
  overlayContainer: OverlayContainer;

  constructor() {
    when(this.mockedActivatedRoute.params).thenReturn(of({}));
    when(this.mockedMdcDialog.open(anything(), anything())).thenReturn(instance(this.mockedQuestionDialogRef));
    when(this.mockedSFAdminAuthGuard.allowTransition(anything())).thenReturn(of(true));
    when(this.mockedProjectService.getTexts(anything())).thenReturn(
      of([
        { id: 'text01', bookId: 'MAT', name: 'Matthew' } as Text,
        { id: 'text02', bookId: 'LUK', name: 'Luke' } as Text
      ])
    );
    when(this.mockedQuestionService.connect('text01')).thenResolve(
      this.createQuestionData('text01', [
        { id: 'q1Id', owner: undefined, project: undefined, text: 'Book 1, Q1 text' },
        { id: 'q2Id', owner: undefined, project: undefined, text: 'Book 1, Q2 text' }
      ])
    );
    when(this.mockedQuestionService.connect('text02')).thenResolve(
      this.createQuestionData('text02', [{ id: 'q3Id', owner: undefined, project: undefined, text: 'Book 2, Q3 text' }])
    );

    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [CheckingOverviewComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: SFAdminAuthGuard, useFactory: () => instance(this.mockedSFAdminAuthGuard) },
        { provide: MdcDialog, useFactory: () => instance(this.mockedMdcDialog) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedProjectService) },
        { provide: QuestionService, useFactory: () => instance(this.mockedQuestionService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
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

  get textRows(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('mdc-list-item'));
  }

  get questionEdits(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('mdc-list-item button'));
  }

  waitForQuestions(): void {
    this.fixture.detectChanges();
    tick();
    this.fixture.detectChanges();
  }

  /**
   * simulate row click since actually clicking on the row deosn't fire the selectionChange event
   */
  simulateRowClick(index: number): void {
    const textId = this.component.texts[index].id;
    this.component.itemVisible[textId] = !this.component.itemVisible[textId];
    this.fixture.detectChanges();
    flush();
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

  private createQuestionData(id: string, data: Question[]): QuestionData {
    const doc = new MockRealtimeDoc<Question[]>('ot-json0', id, data);
    return new QuestionData(doc, instance(this.mockedRealtimeOfflineStore));
  }
}
