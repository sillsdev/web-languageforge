import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { MultitextComponent } from '../multitext/multitext.component';
import { LexEntry } from '../shared/models/lex-entry';
import { LfApiService } from '../shared/services/lf-api.service';
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
    console.log(this.getAllMultitextBoxes())
    this.lfApiService.addEntry(this.getAllMultitextBoxes()).subscribe( response => {
      console.log(response);
    });
  }

  getAllMultitextBoxes() {
    let rtn: any = [];
    let count: number = 0;
    let multitextBoxContentArray: any = [];
    let entryObject = new LexEntry();
    if (this.id!=""){
      entryObject.id=this.id;
    }
    this.multitextBoxes.forEach(function(multitextBox) {
      let language=multitextBox.language;
      console.log("language:"+language);
      if (count == 0){
        entryObject.lexeme={[language]: {value: multitextBox.content}};
      }
      else{
        multitextBoxContentArray.push(multitextBox.content);
        entryObject.senses=multitextBoxContentArray;
      }
      count+=1;
    })
    return entryObject;
  }
}