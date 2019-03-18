import { MDC_DIALOG_DATA, MdcDialogRef } from '@angular-mdc/web';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Question } from '../../core/models/question';
import { VerseRefData } from '../../core/models/verse-ref-data';
import { SFValidators } from '../../shared/sfvalidators';

export interface QuestionDialogData {
  editMode: boolean;
  question: Question;
}

export interface QuestionDialogResult {
  scriptureStart?: string;
  scriptureEnd?: string;
  text?: string;
}

@Component({
  templateUrl: './question-dialog.component.html',
  styleUrls: ['./question-dialog.component.scss']
})
export class QuestionDialogComponent implements OnInit {
  private static verseRefDataToString(verseRefData: VerseRefData): string {
    let result: string = verseRefData.book ? verseRefData.book : '';
    result += verseRefData.chapter ? ' ' + verseRefData.chapter : '';
    result += verseRefData.verse ? ':' + verseRefData.verse : '';
    return result;
  }

  modeLabel = this.data && this.data.editMode ? 'Edit' : 'New';
  questionForm: FormGroup = new FormGroup({
    scriptureStart: new FormControl('', [Validators.required, SFValidators.verseStr]),
    scriptureEnd: new FormControl('', [SFValidators.verseStr]),
    questionText: new FormControl('', [Validators.required])
  });

  constructor(
    private readonly dialogRef: MdcDialogRef<QuestionDialogComponent>,
    @Inject(MDC_DIALOG_DATA) private data: QuestionDialogData
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.question) {
      const question = this.data.question;
      if (question.scriptureStart) {
        this.questionForm.controls.scriptureStart.setValue(
          QuestionDialogComponent.verseRefDataToString(question.scriptureStart)
        );
      }
      if (question.scriptureEnd) {
        this.questionForm.controls.scriptureEnd.setValue(
          QuestionDialogComponent.verseRefDataToString(question.scriptureEnd)
        );
      }
      if (question.text) {
        this.questionForm.controls.questionText.setValue(question.text);
      }
    }
  }

  submit(): void {
    if (this.questionForm.invalid) {
      return;
    }

    this.dialogRef.close({
      scriptureStart: this.questionForm.get('scriptureStart').value,
      scriptureEnd: this.questionForm.get('scriptureEnd').value,
      text: this.questionForm.get('questionText').value
    } as QuestionDialogResult);
  }
}
