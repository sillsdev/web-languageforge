import { MDC_DIALOG_DATA, MdcDialogRef } from '@angular-mdc/web';
import { Component, Inject, OnInit } from '@angular/core';
import { Canon } from '../core/models/scripture/canon';
import { VerseRefData } from '../core/models/verse-ref-data';

/** Dialog to allow selection of a particular Scripture reference. */
@Component({
  selector: 'app-scripture-reference-chooser',
  templateUrl: './scripture-chooser-dialog.component.html',
  styleUrls: ['./scripture-chooser-dialog.component.scss']
})
export class ScriptureChooserDialogComponent implements OnInit {
  showing: 'books' | 'chapters' | 'verses';
  readonly numBooks = 66;
  readonly firstBook = 0;
  readonly numOtBooks = 39;
  books = Canon.allBookIds.slice(this.firstBook, this.numBooks);
  otBooks = Canon.allBookIds.slice(this.firstBook, this.numOtBooks);
  ntBooks = Canon.allBookIds.slice(this.numOtBooks, this.numBooks);
  chapters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // TODO use real, project-derived data here and in verses
  verses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 20, 21, 22, 23, 31, 32, 33, 34];

  /** User's selection */
  selection: VerseRefData = {};

  /** @param input sets the Scripture reference to be highlighted to the user as they navigate the dialog. */
  constructor(
    public dialogRef: MdcDialogRef<ScriptureChooserDialogComponent>,
    @Inject(MDC_DIALOG_DATA) public input: VerseRefData
  ) {}

  ngOnInit() {
    this.showBookSelection();
  }

  clickBook(event: Event) {
    this.selection.book = (event.target as HTMLElement).innerText;
    this.showChapterSelection();
  }

  clickChapter(event: Event) {
    this.selection.chapter = (event.target as HTMLElement).innerText;
    this.showVerseSelection();
  }

  clickVerse(event: Event) {
    this.selection.verse = (event.target as HTMLElement).innerText;
    this.dialogRef.close(this.selection);
  }

  clickBackoutButton() {
    if (this.showing === 'books') {
      this.dialogRef.close(null);
    }
    if (this.showing === 'chapters') {
      this.showBookSelection();
    }
    if (this.showing === 'verses') {
      this.showChapterSelection();
    }
  }

  showBookSelection() {
    this.showing = 'books';
  }

  showChapterSelection() {
    this.showing = 'chapters';
  }

  showVerseSelection() {
    this.showing = 'verses';
  }
}
