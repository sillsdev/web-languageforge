import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { CheckingAnswersComponent } from './checking-answers.component';

describe('CheckingAnswersComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should create', () => {
    expect(env.component).toBeTruthy();
  });
});

class TestEnvironment {
  component: CheckingAnswersComponent;
  fixture: ComponentFixture<CheckingAnswersComponent>;

  constructor() {
    TestBed.configureTestingModule({
      declarations: [CheckingAnswersComponent],
      imports: [UICommonModule]
    });
    this.fixture = TestBed.createComponent(CheckingAnswersComponent);
    this.component = this.fixture.componentInstance;
  }
}
