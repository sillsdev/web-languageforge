import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleProjectComponent } from './single-project.component';

describe('SingleProjectComponent', () => {
  let component: SingleProjectComponent;
  let fixture: ComponentFixture<SingleProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
