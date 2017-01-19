import { Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ProjectService } from '../shared/services/project.service';
import { CommentService } from '../shared/services/comment.service';

import { MaterializeDirective, MaterializeAction } from 'angular2-materialize';
declare var Materialize: any;

@Component({
  moduleId: module.id,
  selector: 'review',
  templateUrl: 'review.component.html'
})
export class ReviewComponent implements OnInit, OnDestroy {

  private id: string;
  private sub: any;
  private words: any[];
  private currentWord: any;
  private currentLanguageCode: string;
  private currentInterfaceLanguageCode: string;
  private currentIdx = 0;

  private isClicked = false;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              private commentService: CommentService) { }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.setLanguageSettings();
      this.getWords(this.id);
    });
  }

  setLanguageSettings() {
    let projectSettings = this.projectService.getSelectedProjectSettings();
    this.currentLanguageCode = projectSettings.languageCode;
    this.currentInterfaceLanguageCode = projectSettings.interfaceLanguageCode;
  }

  getWords(projectId: string) {
    this.projectService.getWordList(projectId).subscribe(response => {
      this.words = response.entries;
      this.currentWord = this.words[this.currentIdx];
      this.currentLanguageCode = Object.keys(this.currentWord.lexeme)[0];
    });
  }

  public incrementWord = () => {
    this.currentIdx += 1;
    if (this.currentIdx > this.words.length - 1) {
      this.currentIdx = 0;
    }
    this.currentWord = this.words[this.currentIdx]
  }

  public decreaementWord = () => {
    this.currentIdx -= 1;
    if (this.currentIdx < 0) {
      this.currentIdx = this.words.length - 1;
    }
    this.currentWord = this.words[this.currentIdx];
  }

  public upVote = () => {
    this.sendComment('I upvoted this word through the Review & Suggest app', this.currentWord.id);
    console.log("I upvoted " + this.currentWord.id);
  }

  public downVote = () => {
    this.sendComment('I downvoted this word through the Review & Suggest app', this.currentWord.id);
    console.log("I downvoted " + this.currentWord.id);
  }

  public modalActions = new EventEmitter<string | MaterializeAction>();
  openModal() {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  closeModal() {
    this.modalActions.emit({ action: "modal", params: ['close'] });
  }

  sendComment(comment: string, id: string){
    this.isClicked = true;
    this.commentService.sendComment(comment, id).subscribe(response => {
      let success = response;
      if (success) {
        let toastContentSuccess = '<span><b>Your response has been sent!</b></span>';
        Materialize.toast(toastContentSuccess, 1000, 'green');
        this.incrementWord();
      }
      else {
        let toastContentFailed = '<span><b>Your response failed to send!</b></span>';
        Materialize.toast(toastContentFailed, 1000, 'red');
      }
      this.isClicked = false;
    });
  }

  submitComment() {
    var inputValue = (<HTMLInputElement>document.getElementById("placeholderForComment")).value;
    console.log("My commment is :" + inputValue);
    this.closeModal();
    (<HTMLInputElement>document.getElementById("placeholderForComment")).value = '';
    this.sendComment(inputValue, this.currentWord.id);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
