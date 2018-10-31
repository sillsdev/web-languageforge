import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatFormFieldModule, MatToolbarModule } from '@angular/material';
import { UserService } from '@xforge-common/user.service';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { ProjectDashboardComponent } from './project-dashboard.component';

describe('ProjectDashboardComponent', () => {
  let component: ProjectDashboardComponent;
  let fixture: ComponentFixture<ProjectDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDashboardComponent],
      imports: [HttpClientModule, ReactiveFormsModule, MatFormFieldModule, MatToolbarModule, MatDialogModule],
      providers: [OAuthService, UserService, UrlHelperService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDashboardComponent);
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
