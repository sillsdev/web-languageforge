import {$, $$, browser, by, By, element, ExpectedConditions, Key} from 'protractor';
import { SfTextPage } from './textPage';
import { Utils } from '../../../bellows/pages/utils.js';

const CONDITION_TIMEOUT = 3000;
const textPage = new SfTextPage();
const utils = new Utils();
/*
 * This object tests the Question page view where the user can do the following:
 * Answers {add, edit, archive (instead of delete) }
 * Comments {add, edit, archive (instead of delete) }
 * Note: "delete" is a reserved word, and the functionality will be moved to "archiving" later
 */
export class SfQuestionPage {
  notice = utils.notice;

  get(projectName: string, textTitle: string, questionTitle: string) {
    textPage.get(projectName, textTitle);
    textPage.questionLink(questionTitle).click();
  }
  answers = new Answers();

  comments = new Comments(this);
}

// Flag for Export
class Flags {
  answers: any;
  constructor(answers: any) {
    this.answers = answers;
  }

  lastButtonSet() {
    return this.answers.last().element(by.css('.answer')).element(by.css('.fa-flag'));
  }

  lastButtonClear() {
    return this.answers.last().element(by.css('.answer')).element(by.css('.fa-flag-o'));
  }
}

// TODO Answers and Comments could inherit from a base class.
class Answers {
    flags = new Flags(this);

    list = element.all(by.repeater('(answerId, answer) in question.answers'));

    // Return the handle to the last answer in the list
    last() {
      return this.list.last();
    }

    // Add new answer to the end of the answers list
    add(answer: any) {
      const answerCtrl = browser.element(by.id('comments'));
      // Using ID "Comments" contains Answers and Comments
      const newAnswer = answerCtrl.element(by.id('question-new-answer'));
      newAnswer.sendKeys(answer);
      browser.wait(ExpectedConditions.textToBePresentInElementValue(newAnswer, answer),
        CONDITION_TIMEOUT);
      answerCtrl.element(by.id('doneBtn')).click();
    }

    // Edit last answer
    edit(answer: any) {
      const editCtrl = this.last().element(by.css('.answer .answer-footer'))
        .element(by.linkText('edit'));
      editCtrl.click();
      // Clicking 'edit' changes the DOM so these handles are updated here
      const answersField = this.last().element(by.css('.answer'))
        .element(by.css('textarea.editAnswer'));
      const saveCtrl = this.last().element(by.css('.answerBtn'));

      answersField.sendKeys(Key.chord(Key.CONTROL, 'a'));
      answersField.sendKeys(answer);
      browser.wait(ExpectedConditions.textToBePresentInElementValue(answersField, answer),
        CONDITION_TIMEOUT);
      saveCtrl.click();
    }

    // Delete the answer at index.  If no index given, delete the last answer.
    // Note: "delete" is a reserved word, and
    // the functionality will be moved to "archive" at a later time
    // TODO make the index actually a number. Right now it could be a string or number.
    archive(index: any) {
      if (index === '') {
        this.last().element(by.css('.answer')).element(by.linkText('delete')).click();
      } else {
        // console.log('should delete answer at index ' + index);
        this.list.get(index).element(by.css('.answer')).element(by.linkText('delete'))
          .click();
      }

      utils.clickModalButton('Delete');
    }

    // Private method to handle the upvote or downvote of an answer.
    // index: index of the answers.list to vote
    // direction: 0=upvote, 1=downvote
    private vote(index: any, direction: any) {
      this.list.get(index).element(by.css('.vote')).all(by.css('a'))
        .then(function (voteCtrls) {
          voteCtrls[direction].click();
        });
    }

    // Upvote the answer at the index of answers.list
    upvote(index: number) {
      this.vote(index, 0);
    }

    // Downvote the answer at the index of the answers.list
    downvote(index: number) {
      this.vote(index, 1);
    }

    votes(index: number) {
      return this.list.get(index).element(by.css('.vote > span'));
    }
}

class Comments {
  sfQuestionPage: any;
  constructor(sfQuestionPage: any) {
    this.sfQuestionPage = sfQuestionPage;
  }
  list = element.all(by.repeater('comment in answer.comments'));

  // Return the handle to the last comment in the list
  last() {
    return this.list.last();
  }

  // Add a comment to the last (most recent) Answer on the page
  addToLastAnswer(comment: any) {
    const addCommentCtrl = this.sfQuestionPage.answers.last().element(by.css('.comments'))
      .element(by.css('a.addCommentLink'));
    const commentField = this.sfQuestionPage.answers.last().element(by.model('newComment.content'));
    const submit = this.sfQuestionPage.answers.last().element(by.css('.save-new-comment'));

    // Click "add comment" at the end of the Answers list to un-collapse the comment text area.
    addCommentCtrl.click();
    browser.wait(ExpectedConditions.visibilityOf(commentField), CONDITION_TIMEOUT);
    commentField.sendKeys(comment);
    browser.wait(ExpectedConditions.textToBePresentInElementValue(commentField,
      comment), CONDITION_TIMEOUT);
    submit.click();
  }

  // Edit the last comment.  Comments are interspersed with the answers
  edit(comment: any) {
    const editCtrl = this.last().element(by.linkText('edit'));
    editCtrl.click();

    // Clicking 'edit' changes the DOM so these handles are updated here
    const commentsField = this.last().element(by.css('textarea'));
    const saveCtrl = this.last().element(by.partialButtonText('Save'));

    commentsField.sendKeys(Key.chord(Key.CONTROL, 'a'));
    commentsField.sendKeys(comment);
    browser.wait(ExpectedConditions.textToBePresentInElementValue(commentsField, comment),
      CONDITION_TIMEOUT);
    saveCtrl.click();
  }

  // Delete the comment at index.  If no index given, delete the last comment.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  // TODO
  archive(index: any) {
    if (index === '') {
      this.last().element(by.linkText('delete')).click();
    } else {
      // console.log('should delete comment at index ' + index);
      this.list.get(index).element(by.linkText('delete')).click();
    }

    utils.clickModalButton('Delete');
  }
}
