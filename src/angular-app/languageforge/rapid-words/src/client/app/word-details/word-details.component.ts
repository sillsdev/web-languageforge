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
    this.lfApiService.addEntry(this.getAllMultitextBoxes());
  }
  getAllMultitextBoxes() {
    let rtn: any = [];
    let count: number = 0;
    let multitextBoxContentArray: any = [];
    let entryObject = new LexEntry();
    if (this.id){
      entryObject.id=this.id;
    }
    this.multitextBoxes.forEach(function(multitextBox) {
      if (count == 0){
        entryObject.lexeme=multitextBox.content;
      }
      else{
        multitextBoxContentArray.push(multitextBox.content);
        entryObject.senses=multitextBoxContentArray;
      }
      count+=1;
    })
    return entryObject;
    //where do I add language?
    
    // if(this.id){
    //   rtn.push({id: this.id
    // })}
    // this.multitextBoxes.forEach(function(multitextBox) {
    //   if (count == 0){
    //     rtn.push({"lexeme": {
    //       "th":{
    //         "value": multitextBox.content
    //       }
    //     },
    //     })
    //   }
    //   else{
    //     rtn.push({"senses": [
    //       {
    //         "guid": "5f4b0cd9-a6da-4c71-9e3b-eff03aacd61d",
    //         "definition":{
    //           "en":{
    //             "value": multitextBox.content
    //           }
    //         }
    //       }
    //     ]
    //   })}
    //   count+=1;
    // });
    // return rtn;
  }
}