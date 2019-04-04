import { MdcDialog, MdcDialogModule, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, resetCalls, verify, when } from 'ts-mockito';
import { AuthService } from 'xforge-common/auth.service';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { Question } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { Text } from '../../core/models/text';
import { TextJsonDataId } from '../../core/models/text-json-data-id';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';
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
      verify(env.mockedTextService.getQuestionData(anything())).twice();

      resetCalls(env.mockedTextService);
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedTextService.getQuestionData(anything())).never();
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
      verify(env.mockedTextService.getQuestionData(anything())).twice();

      resetCalls(env.mockedTextService);
      env.clickElement(env.addQuestionButton);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedTextService.getQuestionData(anything())).once();
      expect().nothing();
    }));
  });

  describe('Edit Question', () => {
    it('should expand/collapse questions in book text', fakeAsync(() => {
      const env = new TestEnvironment();
      const id = new TextJsonDataId('text01', 1);
      env.waitForQuestions();
      expect(env.textRows.length).toEqual(2);
      expect(env.questionEdits.length).toEqual(0);
      expect(env.component.itemVisible[id.toString()]).toBeFalsy();
      expect(env.component.questions[id.toString()].data.length).toBeGreaterThan(0);
      expect(env.component.questionCount(id.textId, id.chapter)).toBeGreaterThan(0);

      env.simulateRowClick(0);
      expect(env.textRows.length).toEqual(3);
      env.simulateRowClick(1, id);
      expect(env.textRows.length).toEqual(5);
      expect(env.questionEdits.length).toEqual(2);

      env.simulateRowClick(1, id);
      expect(env.textRows.length).toEqual(3);
      expect(env.questionEdits.length).toEqual(0);
      env.simulateRowClick(0);
      expect(env.textRows.length).toEqual(2);
    }));

    it('should edit question', fakeAsync(() => {
      const env = new TestEnvironment();
      const id = new TextJsonDataId('text01', 1);
      when(env.mockedQuestionDialogRef.afterClosed()).thenReturn(
        of({
          scriptureStart: 'MAT 3:3',
          scriptureEnd: '',
          text: ''
        })
      );
      env.waitForQuestions();
      env.simulateRowClick(0);
      env.simulateRowClick(1, id);
      expect(env.textRows.length).toEqual(5);
      expect(env.questionEdits.length).toEqual(2);
      verify(env.mockedTextService.getQuestionData(anything())).twice();

      resetCalls(env.mockedTextService);
      env.clickElement(env.questionEdits[0]);
      verify(env.mockedMdcDialog.open(anything(), anything())).once();
      verify(env.mockedTextService.getQuestionData(anything())).never();
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
  mockedTextService: TextService = mock(TextService);
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
        { id: 'text01', bookId: 'MAT', name: 'Matthew', chapters: [{ number: 1 }] } as Text,
        { id: 'text02', bookId: 'LUK', name: 'Luke', chapters: [{ number: 1 }] } as Text
      ])
    );
    const text1_1id = new TextJsonDataId('text01', 1);
    when(this.mockedTextService.getQuestionData(deepEqual(text1_1id))).thenResolve(
      this.createQuestionData(text1_1id, [
        { id: 'q1Id', ownerRef: undefined, projectRef: undefined, text: 'Book 1, Q1 text' },
        { id: 'q2Id', ownerRef: undefined, projectRef: undefined, text: 'Book 1, Q2 text' }
      ])
    );
    const text1_3id = new TextJsonDataId('text01', 3);
    when(this.mockedTextService.getQuestionData(deepEqual(text1_3id))).thenResolve(
      this.createQuestionData(text1_3id, [])
    );
    const text2_1id = new TextJsonDataId('text02', 1);
    when(this.mockedTextService.getQuestionData(deepEqual(text2_1id))).thenResolve(
      this.createQuestionData(text2_1id, [
        { id: 'q3Id', ownerRef: undefined, projectRef: undefined, text: 'Book 2, Q3 text' }
      ])
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
        { provide: TextService, useFactory: () => instance(this.mockedTextService) },
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
  simulateRowClick(index: number, id?: TextJsonDataId): void {
    let idStr: string;
    if (id) {
      idStr = id.toString();
    } else {
      idStr = this.component.texts[index].id;
    }
    this.component.itemVisible[idStr] = !this.component.itemVisible[idStr];
    this.fixture.detectChanges();
    flush();
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = element.nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    flush();
  }

  makeUserAProjectAdmin(isProjectAdmin: boolean = true) {
    this.component.isProjectAdmin$ = of(isProjectAdmin);
  }

  private createQuestionData(id: TextJsonDataId, data: Question[]): QuestionData {
    const doc = new MockRealtimeDoc<Question[]>('ot-json0', id.toString(), data);
    return new QuestionData(doc, instance(this.mockedRealtimeOfflineStore));
  }
}
