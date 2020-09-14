import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleUserComponent } from './single-user.component';

describe('SingleUserComponent', () => {
  let component: SingleUserComponent;
  let fixture: ComponentFixture<SingleUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
