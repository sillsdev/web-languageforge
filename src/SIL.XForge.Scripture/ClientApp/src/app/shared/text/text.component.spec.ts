import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { QuillModule } from 'ngx-quill';
import { instance, mock } from 'ts-mockito';

import { TextService } from '../../core/text.service';
import { TextComponent } from './text.component';

describe('TextComponent', () => {
  let component: TextComponent;
  let fixture: ComponentFixture<TextComponent>;

  const mockedTextService = mock(TextService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        QuillModule
      ],
      declarations: [TextComponent],
      providers: [
        { provide: TextService, useFactory: () => instance(mockedTextService) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
