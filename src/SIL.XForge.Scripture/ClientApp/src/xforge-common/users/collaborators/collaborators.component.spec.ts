import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { instance, mock, verify, when } from 'ts-mockito';
import { NoticeService } from '../../notice.service';
import { InviteAction, ProjectService } from '../../project.service';
import { UICommonModule } from '../../ui-common.module';
import { CollaboratorsComponent } from './collaborators.component';

describe('CollaboratorsComponent', () => {
  it('should display error when email is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTextFieldValue(env.emailInput, 'notavalidemail');
    expect(env.component.userInviteForm.controls.email.hasError('email')).toBe(true);
    env.setTextFieldValue(env.emailInput, 'notavalidemail@bad');
    expect(env.component.userInviteForm.controls.email.hasError('email')).toBe(true);
    expect(env.component.inviteDisabled).toBe(true);
    env.setTextFieldValue(env.emailInput, 'validemail@example.com');
    expect(env.component.userInviteForm.controls.email.hasError('email')).toBe(false);
    expect(env.component.inviteDisabled).toBe(false);
  }));

  it('should display action messages', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTextFieldValue(env.emailInput, env.userInSFEmail);
    env.clickButton(env.inviteButton);
    verify(env.mockedProjectService.onlineInvite(env.userInSFEmail)).once();
    let message = 'An email has been sent to ' + env.userInSFEmail + ' adding them to this project.';
    verify(env.mockedNoticeService.show(message)).once();
    env.setTextFieldValue(env.emailInput, env.newUserEmail);
    env.clickButton(env.inviteButton);
    message = 'An invitation email has been sent to ' + env.newUserEmail + '.';
    verify(env.mockedNoticeService.show(message)).once();
    env.setTextFieldValue(env.emailInput, env.userInProjectEmail);
    env.clickButton(env.inviteButton);
    message = 'This user is already part of the project.';
    verify(env.mockedNoticeService.show(message)).once();
  }));
});

class TestEnvironment {
  fixture: ComponentFixture<CollaboratorsComponent>;
  component: CollaboratorsComponent;

  newUserEmail = 'newuser@example.com';
  userInSFEmail = 'userinscriptureforge@example.com';
  userInProjectEmail = 'userinprojectemail@example.com';
  mockedNoticeService: NoticeService = mock(NoticeService);
  mockedProjectService: ProjectService = mock(ProjectService);

  constructor() {
    TestBed.configureTestingModule({
      declarations: [CollaboratorsComponent],
      imports: [UICommonModule],
      providers: [
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) }
      ]
    });

    this.setupMockInviteActions();
    this.fixture = TestBed.createComponent(CollaboratorsComponent);
    this.component = this.fixture.componentInstance;

    this.fixture.detectChanges();
    tick();
  }

  get emailInput(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#email-input');
  }

  get inviteButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#btn-invite');
  }

  clickButton(element: HTMLElement) {
    element.click();
    this.fixture.detectChanges();
    tick();
  }

  setTextFieldValue(element: HTMLElement, value: string) {
    const inputElem: HTMLInputElement = element.querySelector('input');
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }

  private setupMockInviteActions() {
    when(this.mockedProjectService.onlineInvite(this.userInSFEmail)).thenResolve(InviteAction.Joined);
    when(this.mockedProjectService.onlineInvite(this.newUserEmail)).thenResolve(InviteAction.Invited);
    when(this.mockedProjectService.onlineInvite(this.userInProjectEmail)).thenResolve(InviteAction.None);
  }
}
