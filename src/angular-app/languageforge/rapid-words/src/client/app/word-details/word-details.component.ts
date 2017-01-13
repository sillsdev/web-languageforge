import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MultitextComponent } from '../multitext/multitext.component';
@Component({
  moduleId: module.id,
  selector: 'worddetails',
  templateUrl: 'word-details.component.html',
  styleUrls: ['word-details.component.css'],

})

export class WordDetailsComponent implements OnInit {

  @ViewChildren(MultitextComponent) multitextBoxes: QueryList<MultitextComponent>;
  showDetails: Boolean=false;
  detailLabels: any[] = ["Citation Form", "Pronunciation", "CV Pattern", "Tone"];
  id="12345"
  constructor() { }

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
    console.log("sendEntry called");
    console.log(this.getAllMultitextBoxes())
    // lex_entry_update(this.getAllMultitextBoxes());
  }
  getAllMultitextBoxes() {
    let rtn: any = [];
    if(this.id){
      rtn.push({id: this.id
    })}
    this.multitextBoxes.forEach(function(multitextBox) {
      rtn.push({label: multitextBox.label,
        content: multitextBox.content});
    });
    return rtn;
  }
}