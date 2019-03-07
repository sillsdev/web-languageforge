import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuillModule } from 'ngx-quill';
import { instance, mock } from 'ts-mockito';
import { DomainModel } from 'xforge-common/models/domain-model';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { TextService } from '../../../core/text.service';
import { TextComponent } from '../../../shared/text/text.component';
import { CheckingTextComponent } from './checking-text.component';

describe('CheckingTextComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should create', () => {
    expect(env.component).toBeTruthy();
  });
});

class TestEnvironment {
  component: CheckingTextComponent;
  fixture: ComponentFixture<CheckingTextComponent>;

  mockedDomainModel: DomainModel;
  mockedTextService: TextService;
  constructor() {
    this.mockedDomainModel = mock(DomainModel);
    this.mockedTextService = mock(TextService);

    TestBed.configureTestingModule({
      declarations: [CheckingTextComponent, TextComponent],
      imports: [UICommonModule, HttpClientTestingModule, QuillModule],
      providers: [
        { provide: DomainModel, useFactory: () => instance(this.mockedDomainModel) },
        { provide: TextService, useFactory: () => instance(this.mockedTextService) }
      ]
    });
    this.fixture = TestBed.createComponent(CheckingTextComponent);
    this.component = this.fixture.componentInstance;
  }
}
