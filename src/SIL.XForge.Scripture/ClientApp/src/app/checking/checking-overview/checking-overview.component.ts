import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SFAdminAuthGuard } from '../../shared/sfadmin-auth.guard';
import { QuestionDialogComponent, QuestionDialogData } from '../question-dialog/question-dialog.component';

@Component({
  selector: 'app-checking-overview',
  templateUrl: './checking-overview.component.html',
  styleUrls: ['./checking-overview.component.scss']
})
export class CheckingOverviewComponent implements OnInit {
  isProjectAdmin$: Observable<boolean>;

  constructor(private readonly dialog: MdcDialog, private readonly adminAuthGuard: SFAdminAuthGuard) {}

  ngOnInit() {
    this.isProjectAdmin$ = this.adminAuthGuard.allowTransition();
  }

  questionDialog(newMode = false) {
    const dialogConfig = {
      data: {
        newMode
      } as QuestionDialogData
    } as MdcDialogConfig;
    const dialogRef = this.dialog.open(QuestionDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    });
  }
}
