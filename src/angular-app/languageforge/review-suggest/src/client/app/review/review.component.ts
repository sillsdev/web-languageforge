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

  id: string;
  sub: any;
  words: any[];
  currentWord: any;
  projectSettings: any;
  currentLanguageCode: string;
  currentWordIdx: number = 0;
  isClicked: boolean = false;
  textComment: string;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              private commentService: CommentService) { }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.getProjectSettings();
      this.getWords();
    });
  }

  getProjectSettings() {
    this.projectService.getSelectedProjectSettings().subscribe(response => {
      if (response.success) {
        this.projectSettings = response.data;
      } else {
        let toastContentFailed = '<b>Failed to get project settings! ' + response.message + '</b>';
        Materialize.toast(toastContentFailed, 2000, 'red');
      }
    }, error => {
      this.handleError(error);
    });
  }

  getWords() {
    this.projectService.getSelectedProjectWordList().subscribe(response => {
      if (response.success) {
        this.words = response.data.entries;
        this.updateCurrentWord();
      } else {
        let toastContentFailed = '<b>Failed to get words! ' + response.message + '</b>';
        Materialize.toast(toastContentFailed, 2000, 'red');
      }
    }, error => {
      this.handleError(error);
    });
  }

  incrementWord() {
    this.currentWordIdx += 1;
    if (this.currentWordIdx > this.words.length - 1) {
      this.currentWordIdx = 0;
    }
    this.updateCurrentWord();
  }

  decreaementWord() {
    this.currentWordIdx -= 1;
    if (this.currentWordIdx < 0) {
      this.currentWordIdx = this.words.length - 1;
    }
    this.updateCurrentWord();
  }

  updateCurrentWord() {
    this.currentWord = this.words[this.currentWordIdx];
    this.currentLanguageCode = Object.keys(this.currentWord.lexeme)[0];
  }

  upVote() {
    this.sendComment('I upvoted this word through the Review & Suggest app', this.currentWord.id);
  }

  downVote() {
    this.sendComment('I downvoted this word through the Review & Suggest app', this.currentWord.id);
  }

  modalActions: EventEmitter<string | MaterializeAction> = new EventEmitter<string | MaterializeAction>();
  openModal() {
    this.modalActions.emit({ action: "modal", params: ['open'] });
  }

  closeModal() {
    this.modalActions.emit({ action: "modal", params: ['close'] });
  }

  sendComment(comment: string, id: string) {
    this.isClicked = true;
    this.commentService.sendComment(comment, id).subscribe(response => {
      let success = response;
      if (success) {
        let toastContentSuccess = '<b>Your response has been sent!</b>';
        Materialize.toast(toastContentSuccess, 2000, 'green');
        this.incrementWord();
      }
      else {
        let toastContentFailed = '<b>Your response failed to send!</b>';
        Materialize.toast(toastContentFailed, 2000, 'red');
      }
      this.isClicked = false;
    }, error => {
      this.handleError(error);
    });
  }

  submitComment() {
    this.sendComment(this.textComment, this.currentWord.id);
    this.textComment = null;
    this.closeModal();
  }

  handleError(error: any) {
    let toastContentFailed = '<b>Error! ' + error.statusText + '</b>';
    Materialize.toast(toastContentFailed, 2000, 'red');
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
