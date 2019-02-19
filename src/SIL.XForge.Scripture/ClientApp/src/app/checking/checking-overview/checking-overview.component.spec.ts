import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckingOverviewComponent } from './checking-overview.component';

describe('CheckingOverviewComponent', () => {
  let component: CheckingOverviewComponent;
  let fixture: ComponentFixture<CheckingOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckingOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckingOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
