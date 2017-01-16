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
    let count: number = 0;
    if(this.id){
      rtn.push({id: this.id
    })}
    this.multitextBoxes.forEach(function(multitextBox) {
      if (count == 0){
        rtn.push({"lexeme": {
          "th":{
            "value": multitextBox.content
          }
        },
        })
      }
      else{
        rtn.push({"senses": [
          {
            "guid": "5f4b0cd9-a6da-4c71-9e3b-eff03aacd61d",
            "definition":{
              "en":{
                "value": multitextBox.content
              }
            }
          }
        ]
      })}
      count+=1;
    });
    return rtn;
  }
}