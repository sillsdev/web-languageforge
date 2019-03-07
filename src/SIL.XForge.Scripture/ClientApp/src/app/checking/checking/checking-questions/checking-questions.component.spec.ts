import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { CheckingQuestionsComponent } from './checking-questions.component';

describe('CheckingQuestionsComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should create', () => {
    expect(env.component).toBeTruthy();
  });
});

class TestEnvironment {
  component: CheckingQuestionsComponent;
  fixture: ComponentFixture<CheckingQuestionsComponent>;

  constructor() {
    TestBed.configureTestingModule({
      declarations: [CheckingQuestionsComponent],
      imports: [UICommonModule]
    });
    this.fixture = TestBed.createComponent(CheckingQuestionsComponent);
    this.component = this.fixture.componentInstance;
  }
}
