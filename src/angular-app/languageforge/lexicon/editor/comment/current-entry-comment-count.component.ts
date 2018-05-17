import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';

export function CurrentEntryCommentCountComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/current-entry-comment-count.component.html',
    controller: ['$scope', 'lexCommentService', ($scope: any, commentService: LexiconCommentService) => {
      $scope.count = commentService.comments.counts.currentEntry;
    }]
  };
}
