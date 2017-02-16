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
  private projectSettings: any;
  private currentLanguageCode: string;
  private currentWordIdx: number = 0;
  private isClicked: boolean = false;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              private commentService: CommentService) { }

  ngOnInit(): void {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getProjectSettings();
      this.getWords(this.id);
    });
  }

  private getProjectSettings(): void {
    this.projectSettings = this.projectService.getSelectedProjectSettings();
  }

  private getWords(projectId: string): void {
    this.projectService.getWordList(projectId).subscribe(response => {
      this.words = response.entries;
      this.updateCurrentWord();
    });
  }

  private incrementWord(): void {
    this.currentWordIdx += 1;
    if (this.currentWordIdx > this.words.length - 1) {
      this.currentWordIdx = 0;
    }
    this.updateCurrentWord();
  }

  private decreaementWord(): void {
    this.currentWordIdx -= 1;
    if (this.currentWordIdx < 0) {
      this.currentWordIdx = this.words.length - 1;
    }
    this.updateCurrentWord();
  }

  private updateCurrentWord(): void {
    this.currentWord = this.words[this.currentWordIdx];
    this.currentLanguageCode = Object.keys(this.currentWord.lexeme)[0];
  }

  private upVote(): void {
    this.sendComment('I upvoted this word through the Review & Suggest app', this.currentWord.id);
  }

  private downVote(): void {
    this.sendComment('I downvoted this word through the Review & Suggest app', this.currentWord.id);
  }

  private modalActions = new EventEmitter<string | MaterializeAction>();
  private openModal(): void {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  private closeModal(): void {
    this.modalActions.emit({ action: "modal", params: ['close'] });
  }

  private sendComment(comment: string, id: string): void{
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

  private submitComment(): void {
    var inputValue = (<HTMLInputElement>document.getElementById("placeholderForComment")).value;
    this.closeModal();
    (<HTMLInputElement>document.getElementById("placeholderForComment")).value = '';
    this.sendComment(inputValue, this.currentWord.id);
  }

  private ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
