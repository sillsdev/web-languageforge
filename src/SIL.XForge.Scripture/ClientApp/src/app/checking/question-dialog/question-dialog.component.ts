import { MDC_DIALOG_DATA, MdcDialogRef } from '@angular-mdc/web';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

export interface QuestionDialogData {
  newMode: boolean;
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
export class QuestionDialogComponent {
  modeLabel = this.data && this.data.newMode ? 'New' : 'Edit';
  questionForm: FormGroup = new FormGroup({
    scriptureStart: new FormControl('', [Validators.required]),
    scriptureEnd: new FormControl(),
    questionText: new FormControl('', [Validators.required])
  });

  constructor(
    private readonly dialogRef: MdcDialogRef<QuestionDialogComponent>,
    @Inject(MDC_DIALOG_DATA) private data: QuestionDialogData
  ) {}

  submit() {
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
