import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemAdministrationComponent } from './system-administration.component';

describe('SystemAdministrationComponent', () => {
  let component: SystemAdministrationComponent;
  let fixture: ComponentFixture<SystemAdministrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemAdministrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemAdministrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
