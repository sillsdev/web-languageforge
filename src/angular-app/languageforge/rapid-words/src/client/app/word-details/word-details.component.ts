import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { MultitextComponent } from '../multitext/multitext.component';
import { LexEntry } from '../shared/models/lex-entry';
import { LfApiService } from '../shared/services/lf-api.service';
import { Constants } from '../shared/constants';

@Component({
  moduleId: module.id,
  selector: 'worddetails',
  templateUrl: 'word-details.component.html',
  styleUrls: ['word-details.component.css'],
})

export class WordDetailsComponent implements OnInit {

  @Input('wordMultitextLanguages') public wordMultitextLanguages: string[] = [];
  @Input('definitionMultitextLanguages') public definitionMultitextLanguages: string[] = [];
  @Input('selectedEntry') selectedEntry: LexEntry;

  @ViewChildren(MultitextComponent) multitextBoxes: QueryList<MultitextComponent>;

  showDetails: Boolean=false;
  detailLabels: any[] = ["Citation Form", "Pronunciation", "CV Pattern", "Tone"];
  id=""
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

  sendEntry() {
    this.lfApiService.addEntry(this.constructLexEntryFromMultitexts()).subscribe( response => {
    });
  }

  constructLexEntryFromMultitexts() {
    var lexEntry = new LexEntry();
    this.multitextBoxes.forEach( multitextBox => {
      multitextBox.addLexemeOrSenseToLexEntry(lexEntry);
    });

    return lexEntry;
  }
}