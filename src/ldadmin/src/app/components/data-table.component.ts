import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';

export interface ColumnDescription {
  [key: string]: string;
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent<T> implements OnInit, OnChanges {
  @ViewChild(MatPaginator, {static: true})
  paginator: MatPaginator;

  @Input()
  dataSource: MatTableDataSource<T>;

  @Output()
  itemSelected = new EventEmitter<T>();

  data: Observable<T[]>;

  @Input()
  pageSize: number;

  @Input()
  pageSizeOptions: number[];

  @Input()
  columns: ColumnDescription;

  columnKeys: string[] = [];
  columnNames: string[] = [];

  constructor() { }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.data = this.dataSource.connect();
    // this.pageSize ??= 10;  // Not available until Typescript 4.0, ditto for pageSizeOptions and columns
    this.pageSize = this.pageSize ?? 10;
    this.pageSizeOptions = this.pageSizeOptions ?? [5, 10, 20, 50, 100];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.columns) {
      this.columnKeys = Object.keys(this.columns ?? {});
      this.columnNames = Object.values(this.columns ?? {});
    }
    if (changes.dataSource) {
      changes.dataSource.previousValue?.disconnect();
      this.dataSource.paginator = this.paginator;
      this.data = this.dataSource.connect();
    }
  }

  clickRow(index: number): void {
    const data = this.dataSource.filteredData;
    const paginator = this.dataSource?.paginator;
    const pageOffset = paginator?.pageIndex * paginator?.pageSize;
    const offsetIndex = pageOffset + index;
    if (offsetIndex >= 0 && offsetIndex < data.length) {
      this.itemSelected.emit(data[offsetIndex]);
    }
  }

}
