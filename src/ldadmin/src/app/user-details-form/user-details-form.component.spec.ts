import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsFormComponent } from './user-details-form.component';

describe('UserDetailsFormComponent', () => {
  let component: UserDetailsFormComponent;
  let fixture: ComponentFixture<UserDetailsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDetailsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
