import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { Chapter, Text } from '../../core/models/text';
import { TextData } from '../../core/models/text-data';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';
import { TranslateOverviewComponent } from './translate-overview.component';

describe('TranslateOverviewComponent', () => {
  it('should list all books in project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    expect(env.title.textContent).toContain('Books Translated');
    expect(env.component.texts.length).toEqual(3);
    expect(env.component.isLoading).toBe(false);
    expect(env.containsListItem(0, 'Matthew')).toBe(true);
    expect(env.containsListItem(1, 'Mark')).toBe(true);
    expect(env.containsListItem(2, 'Luke')).toBe(true);
  }));
});

class TestChapter implements Chapter {
  number: number;
  lastVerse: number;

  constructor(num: number) {
    this.number = num;
    this.lastVerse = 10;
  }
}

class TestTextData extends TextData {
  constructor(doc: RealtimeDoc) {
    super(doc, null);
  }
  get emptyVerseCount(): number {
    return 5;
  }
}

class TestDoc implements Partial<RealtimeDoc> {
  id = 'testdoc01';
  data = 'some data';
  version = 0;
  type = 'TestDoc';
  pendingOps = ['ops'];

  idle() {
    return new Observable<void>();
  }
  fetch() {
    return new Observable<void>().toPromise();
  }
  remoteChanges() {
    return new Observable<void>();
  }
  ingestSnapshot() {
    return new Observable<void>().toPromise();
  }
  subscribe() {
    return new Observable<void>().toPromise();
  }
  submitOp() {
    return new Observable<void>().toPromise();
  }
  destroy() {
    return new Observable<void>().toPromise();
  }
}

class TestEnvironment {
  mockedActivatedRoute = mock(ActivatedRoute);
  mockedProjectService = mock(SFProjectService);
  mockedNoticeService = mock(NoticeService);
  mockedTextService = mock(TextService);

  component: TranslateOverviewComponent;
  fixture: ComponentFixture<TranslateOverviewComponent>;

  constructor() {
    const params = { ['projectId']: 'projectid01' } as Params;
    when(this.mockedActivatedRoute.params).thenReturn(of(params));
    when(this.mockedTextService.connect(anything())).thenResolve(new TestTextData(new TestDoc()));
    TestBed.configureTestingModule({
      declarations: [TranslateOverviewComponent],
      imports: [UICommonModule],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedProjectService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: TextService, useFactory: () => instance(this.mockedTextService) }
      ]
    }).compileComponents();

    this.fixture = TestBed.createComponent(TranslateOverviewComponent);
    this.component = this.fixture.componentInstance;
    this.setupProjectData();
    this.fixture.detectChanges();
    tick();
  }

  get textList(): HTMLElement {
    return this.fixture.nativeElement.querySelector('mdc-list');
  }

  get title(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#translate-overview-title');
  }

  containsListItem(index: number, value: string): boolean {
    const items = this.textList.querySelectorAll('mdc-list-item');
    return items.item(index).textContent === value;
  }

  setupProjectData(): void {
    const projectTexts = [
      new Text({
        id: 'text01',
        bookId: 'MAT',
        name: 'Matthew',
        chapters: [new TestChapter(1), new TestChapter(2)]
      }),
      new Text({
        id: 'text02',
        bookId: 'MRK',
        name: 'Mark',
        chapters: [new TestChapter(1), new TestChapter(2)]
      }),
      new Text({
        id: 'text03',
        bookId: 'LUK',
        name: 'Luke',
        chapters: [new TestChapter(1), new TestChapter(2)]
      })
    ];

    when(this.mockedProjectService.getTexts(anything())).thenReturn(of(projectTexts));
  }
}
