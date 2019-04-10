import { Component, Input } from '@angular/core';
import { Question } from '../../../core/models/question';

@Component({
  selector: 'app-checking-answers',
  templateUrl: './checking-answers.component.html',
  styleUrls: ['./checking-answers.component.scss']
})
export class CheckingAnswersComponent {
  @Input() question: Question;

  constructor() {}
}
