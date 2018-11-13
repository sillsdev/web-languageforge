import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatFormFieldModule, MatIconModule, MatProgressSpinnerModule, MatToolbarModule } from '@angular/material';
import { OAuthLogger, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';

import { DomainModel } from '@xforge-common/models/domain-model';
import { UserService } from '@xforge-common/user.service';
import { SFDOMAIN_MODEL_CONFIG } from '../../app/core/models/sfdomain-model-config';
import { EmailInviteComponent } from './email-invite.component';

describe('EmailInviteComponent', () => {
  let component: EmailInviteComponent;
  let fixture: ComponentFixture<EmailInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmailInviteComponent],
      imports: [ReactiveFormsModule, MatProgressSpinnerModule, HttpClientTestingModule,
        MatToolbarModule, MatFormFieldModule, MatDialogModule, MatIconModule],
      providers: [OAuthService, UrlHelperService, UserService, OAuthLogger,
        { provide: DomainModel, useFactory: () => new DomainModel(SFDOMAIN_MODEL_CONFIG) }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.sendInviteForm.valid).toBeFalsy();
  });

  it('email field validity', () => {
    let errors = {};
    const newPassword = component.sendInviteForm.controls['email'];
    errors = newPassword.errors || {};
    expect(errors['required']).toBeTruthy();
  });
});

