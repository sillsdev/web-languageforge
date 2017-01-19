import { Component, OnInit, ViewChildren, QueryList, Input, Output, EventEmitter } from '@angular/core';
import { MultitextComponent } from '../multitext/multitext.component';
import { LexEntry } from '../shared/models/lex-entry';
import { LfApiService } from '../shared/services/lf-api.service';
import { Constants } from '../shared/constants';

@Component({
  moduleId: module.id,
  selector: 'worddetails',
  templateUrl: 'word-details.component.html',
  styleUrls: ['word-details.component.css'],
  providers: []
})

export class WordDetailsComponent implements OnInit {
  private _selectedEntry: LexEntry;

  @Input('wordMultitextLanguages') public wordMultitextLanguages: string[] = [];
  @Input('definitionMultitextLanguages') public definitionMultitextLanguages: string[] = [];

  @Input('selectedEntry') 
  get selectedEntry() {
    return this._selectedEntry;
  }
  set selectedEntry(entry: LexEntry) {
    this.editing = false;
    this._selectedEntry = entry;
  }

  @Output() entryUpdated = new EventEmitter<LexEntry>();

  @ViewChildren(MultitextComponent) multitextBoxes: QueryList<MultitextComponent>;

  showDetails: Boolean=false;
  detailLabels: any[] = ["Citation Form", "Pronunciation", "CV Pattern", "Tone"];
  id="";
  saveEntryButtonText: string = Constants.WordDetails.SAVE_BUTTON_TEXT_NEW;
  editing: boolean;
  saving: boolean;

  constructor( private lfApiService: LfApiService) {
   }

  ngOnInit() {}
  toggleShowDetails() {
    if (this.showDetails){
      this.showDetails=false;
    }
    else{
      this.showDetails=true;
    }
  }

  saveEntry() {
    this.saving = true;
    this.lfApiService.addEntry(this.constructLexEntryFromMultitexts()).subscribe( response => {
      if (response.success) {
        this.selectedEntry = new LexEntry(response.data);
        this.entryUpdated.emit(this.selectedEntry);
      }
      this.saving = false;
    });
  }

  constructLexEntryFromMultitexts() {
    var lexEntry = new LexEntry();
    if (this._selectedEntry) {
      lexEntry.id = this._selectedEntry.id;
    }
    this.multitextBoxes.forEach( multitextBox => {
      multitextBox.addLexemeOrSenseToLexEntry(lexEntry);
    });

    return lexEntry;
  }

  getSaveButtonText() {
    if (!this.selectedEntry) {
      return Constants.WordDetails.SAVE_BUTTON_TEXT_NEW;
    } else if (this.editing) {
      return Constants.WordDetails.SAVE_BUTTON_TEXT_UPDATE;
    } else if (this.saving) {
      return Constants.WordDetails.SAVE_BUTTON_TEXT_SAVING;
    } else {
      return Constants.WordDetails.SAVE_BUTTON_TEXT_SAVED;
    }
  }

  onEntryEdit() {
    this.editing = true;
  }

  saveButtonClicked() {
    this.saveEntry();
    this.editing = false;
  }
}