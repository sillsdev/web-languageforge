import { Injectable } from '@angular/core';

import { LfApiService } from './lf-api.service';

@Injectable()
export class CommentService {

  constructor(private lfApiService: LfApiService) { }

  sendComment(comment: string, wordId: string) {
    return this.lfApiService.sendComment(comment, wordId).map(response => {
      if (response.success) {
          return true
      }
      return false;
    });
  }
}