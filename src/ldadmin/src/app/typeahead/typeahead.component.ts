import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, retry } from 'rxjs/operators';

@Component({
  selector: 'app-typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.scss']
})
export class TypeaheadComponent implements AfterViewInit {
  @Output() foundData = new EventEmitter<any[]>();
  @Input() getData: (text: string) => Observable<any[]>;
  @ViewChild('input') input: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    fromEvent(this.input.nativeElement, 'input').pipe(
      map((e: KeyboardEvent) => (e.target as HTMLInputElement).value),
      debounceTime(100),
      distinctUntilChanged(),
      switchMap(text => this.getData(text)),
      retry(),
    ).subscribe(this.foundData);
  }
}
