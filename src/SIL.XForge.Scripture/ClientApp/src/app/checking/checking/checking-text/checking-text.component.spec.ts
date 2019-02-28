import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuillModule } from 'ngx-quill';
import { instance, mock } from 'ts-mockito';
import { DomainModel } from 'xforge-common/models/domain-model';
import { UICommonModule } from 'xforge-common/ui-common.module';
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
  constructor() {
    this.mockedDomainModel = mock(DomainModel);

    TestBed.configureTestingModule({
      declarations: [CheckingTextComponent, TextComponent],
      imports: [UICommonModule, HttpClientTestingModule, QuillModule],
      providers: [{ provide: DomainModel, useFactory: () => instance(this.mockedDomainModel) }]
    });
    this.fixture = TestBed.createComponent(CheckingTextComponent);
    this.component = this.fixture.componentInstance;
  }
}
