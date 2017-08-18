import * as angular from 'angular';
import { WordParser } from '../word-parser.service';

export class QuillSuggestionController implements angular.IController {
  qlSuggestions: string[];
  qlInsertSuggestion: (params: { text: string }) => void;

  static $inject: string[] = ['wordParser'];
  constructor(private wordParser: WordParser) {}

  wordCombine(words: string[]): string {
    return this.wordParser.wordCombine(words);
  }

  wordWidthStyle(word: string, isLast: boolean): Object {
    let words = this.wordCombine(this.qlSuggestions);
    if (words.length <= 0) return;

    let space = (isLast) ? 0 : 1;
    return { width: Math.floor((word.length + space) * 100 / words.length) + '%' };
  }

  selectAll(): void {
    let text = this.wordCombine(this.qlSuggestions);
    if (this.qlInsertSuggestion) this.qlInsertSuggestion({ text: text });
  }

  selectWord(index: number): void {
    let text = this.qlSuggestions[index];
    if (this.qlInsertSuggestion) this.qlInsertSuggestion({ text: text });
  }
}
