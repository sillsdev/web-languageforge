import {browser, by, element, ExpectedConditions, Key} from 'protractor';

import {Utils} from '../../../bellows/shared/utils';
import {SfTextPage} from './text.page';

/*
 * This object tests the Question page view where the user can do the following:
 * Answers {add, edit, archive (instead of delete) }
 * Comments {add, edit, archive (instead of delete) }
 * Note: "delete" is a reserved word, and the functionality will be moved to "archiving" later
 */
export class SfQuestionPage {
  private readonly textPage = new SfTextPage();
  private readonly utils = new Utils();

  notice = this.utils.notice;

  async get(projectName: string, textTitle: string, questionTitle: string) {
    await this.textPage.get(projectName, textTitle);
    await SfTextPage.questionLink(questionTitle).click();
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
  // noinspection JSMethodCanBeStatic
  async add(answer: any) {
    const answerCtrl = browser.element(by.id('comments'));
    // Using ID "Comments" contains Answers and Comments
    const newAnswer = answerCtrl.element(by.id('question-new-answer'));
    await newAnswer.sendKeys(answer);
    await browser.driver.wait(ExpectedConditions.textToBePresentInElementValue(newAnswer, answer), Utils.conditionTimeout);
    await answerCtrl.element(by.id('doneBtn')).click();
  }

  // Edit last answer
  async edit(answer: any) {
    const editCtrl = this.last().element(by.css('.answer .answer-footer'))
      .element(by.linkText('edit'));
      await editCtrl.click();
    // Clicking 'edit' changes the DOM so these handles are updated here
    const answersField = this.last().element(by.css('.answer')).element(by.css('textarea.editAnswer'));
    const saveCtrl = this.last().element(by.css('.answerBtn'));

    await answersField.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await answersField.sendKeys(answer);
    await browser.driver.wait(ExpectedConditions.textToBePresentInElementValue(answersField, answer), Utils.conditionTimeout);
    await saveCtrl.click();
  }

  // Delete the answer at index.  If no index given, delete the last answer.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  // TODO make the index actually a number. Right now it could be a string or number.
  async archive(index: any) {
    if (index === '') {
      await this.last().element(by.css('.answer')).element(by.linkText('delete')).click();
    } else {
      // console.log('should delete answer at index ' + index);
      await this.list.get(index).element(by.css('.answer')).element(by.linkText('delete')).click();
    }

    await Utils.clickModalButton('Delete');
  }

  // Private method to handle the upvote or downvote of an answer.
  // index: index of the answers.list to vote
  // direction: 0=upvote, 1=downvote
  private async vote(index: any, direction: any) {
    await this.list.get(index).element(by.css('.vote')).all(by.css('a'))
      .then(async voteCtrls => {
       await voteCtrls[direction].click();
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
  async addToLastAnswer(comment: any) {
    const addCommentCtrl = this.sfQuestionPage.answers.last().element(by.css('.comments'))
      .element(by.css('a.addCommentLink'));
    const commentField = this.sfQuestionPage.answers.last().element(by.model('newComment.content'));
    const submit = this.sfQuestionPage.answers.last().element(by.css('.save-new-comment'));

    // Click "add comment" at the end of the Answers list to un-collapse the comment text area.
    await addCommentCtrl.click();
    await browser.driver.wait(ExpectedConditions.visibilityOf(commentField), Utils.conditionTimeout);
    await commentField.sendKeys(comment);
    await browser.driver.wait(ExpectedConditions.textToBePresentInElementValue(commentField, comment), Utils.conditionTimeout);
    await submit.click();
  }

  // Edit the last comment.  Comments are interspersed with the answers
  async edit(comment: any) {
    const editCtrl = this.last().element(by.linkText('edit'));
    await editCtrl.click();

    // Clicking 'edit' changes the DOM so these handles are updated here
    const commentsField = this.last().element(by.css('textarea'));
    const saveCtrl = this.last().element(by.partialButtonText('Save'));

    await commentsField.sendKeys(Key.chord(Key.CONTROL, 'a'));
    await commentsField.sendKeys(comment);
    await browser.driver.wait(ExpectedConditions.textToBePresentInElementValue(commentsField, comment), Utils.conditionTimeout);
    await saveCtrl.click();
  }

  // Delete the comment at index.  If no index given, delete the last comment.
  // Note: "delete" is a reserved word, and
  // the functionality will be moved to "archive" at a later time
  // TODO
  async archive(index: any) {
    if (index === '') {
      await this.last().element(by.linkText('delete')).click();
    } else {
      // console.log('should delete comment at index ' + index);
      await this.list.get(index).element(by.linkText('delete')).click();
    }

    await Utils.clickModalButton('Delete');
  }
}
