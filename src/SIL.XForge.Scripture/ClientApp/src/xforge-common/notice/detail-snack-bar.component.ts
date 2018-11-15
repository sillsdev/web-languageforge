import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material';

@Component({
  selector: 'app-detail-snack-bar',
  templateUrl: './detail-snack-bar.html',
  styleUrls: ['./notice.component.scss']
})
export class DetailSnackBarComponent {
  constructor(public snackBarRef: MatSnackBarRef<DetailSnackBarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any) { }

  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}
