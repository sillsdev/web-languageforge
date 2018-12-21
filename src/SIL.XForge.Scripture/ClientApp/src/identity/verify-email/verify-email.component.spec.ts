import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { IdentityService } from '../identity.service';
import { VerifyEmailComponent } from './verify-email.component';

class TestEnvironment {
  fixture: ComponentFixture<VerifyEmailComponent>;
  component: VerifyEmailComponent;
  mockedAuthService: AuthService;
  mockedActivatedRoute: ActivatedRoute;
  mockedIdentityService: IdentityService;

  constructor(isVerified = true) {
    this.mockedAuthService = mock(AuthService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedIdentityService = mock(IdentityService);

    const params: Params = { ['key']: 'test_verification_key' };
    when(this.mockedAuthService.isLoggedIn).thenResolve(false);
    when(this.mockedActivatedRoute.queryParams).thenReturn(of(params));
    when(this.mockedIdentityService.verifyEmail(anything())).thenResolve(isVerified);

    TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) }
      ]
    }).compileComponents();
    this.fixture = TestBed.createComponent(VerifyEmailComponent);
    this.component = this.fixture.componentInstance;
  }

  get headingElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#heading'));
  }

  get emailVerfyElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#email-verify'));
  }

  get emailFailElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#email-fail'));
  }

  get promptLoginElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#prompt-login'));
  }

  get invalidMessageElement(): DebugElement {
    return this.fixture.debugElement.query(By.css('#invalid-message'));
  }
}

describe('VerifyEmailComponent', () => {
  it('should show successful verification page', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    // ensure that ngOnInit completes, then detect changes again
    flush();
    env.fixture.detectChanges();
    verify(env.mockedIdentityService.verifyEmail(anything())).once();
    expect(env.component.success).toBeTruthy();
    expect(env.headingElement.nativeElement.textContent).toBe('Account Verification');
    expect(env.emailVerfyElement.nativeElement.textContent).toContain('Email address is verified.');
    expect(env.promptLoginElement.nativeElement.textContent).toBe('You may log in now.');
  }));

  it('should display an error message when email verification fails', fakeAsync(() => {
    const env = new TestEnvironment(false);
    env.fixture.detectChanges();
    // ensure that ngOnInit completes, then detect changes again
    flush();
    env.fixture.detectChanges();
    expect(env.emailFailElement.nativeElement.textContent).toContain('Email verification was unsuccessful');
    expect(env.invalidMessageElement.nativeElement.textContent).toContain('The link was invalid or it has expired');
  }));
});
