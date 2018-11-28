import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';

import { DeleteDialogComponent } from '@xforge-common/delete-dialog/delete-dialog.component';
import { NoticeService } from '@xforge-common/notice.service';
import { SFUserService } from '../../app/core/sfuser.service';

@Component({
  selector: 'app-system-administration',
  templateUrl: './system-administration.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  styleUrls: ['./system-administration.component.scss']
})
export class SystemAdministrationComponent implements OnInit {
  dialogRef: any;
  userCount: number;
  editUserId: string;
  addEditPanel: boolean = false;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = ['no', 'name', 'username', 'project', 'active'];
  enablePagination: boolean = false;
  paginator: MatPaginator;

  @ViewChild(MatPaginator)
  set matPaginator(page: MatPaginator) {
    this.paginator = page;
    this.setDataSourceAttributes();
  }

  constructor(
    private readonly dialog: MatDialog,
    private readonly sfUserService: SFUserService,
    private readonly noticeService: NoticeService
  ) {}

  ngOnInit(): void {
    this.onUserlist();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.user.username.toLowerCase().includes(filter);
    };
  }

  get pagination(): boolean {
    return this.dataSource.filteredData.length > 20;
  }

  onUserlist(): void {
    this.sfUserService.getAllUserProjects().subscribe(response => {
      if (response) {
        this.dataSource.data = response;
        this.userCount = this.dataSource.data.length;
        this.enablePagination = this.pagination;
      }
    });

    // when deleting the record, the pagination reflect the update status taking time to switch the page
    // (i.e) There are 21 records, move to 2nd page delete the 21st record.
    // this function trigger after delete move to 1st page.
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
    }, 750);
  }

  addUser(): void {
    this.addEditPanel = true;
    this.editUserId = '';
  }

  editUser(userId: string): void {
    this.addEditPanel = true;
    this.editUserId = userId;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.userCount = this.dataSource.filteredData.length;
    this.enablePagination = this.pagination;
  }

  openDialog(id: string): void {
    this.addEditPanel = false;
    this.dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '350px',
      height: '200px',
      disableClose: true
    });
    this.dialogRef.updatePosition({ top: '10%', left: '35%' });
    this.dialogRef.afterClosed().subscribe((value: any) => {
      if (value === 'confirmed') {
        this.deleteUser(id);
        this.onUserlist();
      }
    });
  }

  outputUserList(event: any): void {
    if (event === true) {
      this.onUserlist();
      this.addEditPanel = false;
    }
  }

  private async deleteUser(id: string) {
    await this.sfUserService.onlineDeleteUser(id);
    this.noticeService.push(NoticeService.SUCCESS, 'User account deleted successfully');
  }

  private setDataSourceAttributes(): void {
    this.dataSource.paginator = this.paginator;
    if (this.paginator) {
      this.applyFilter('');
    }
  }
}
