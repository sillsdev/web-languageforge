export class WordParser {
  wordCombine(words: string[]): string {
    words = words || [];
    return words.join(this.charSpace());
  }

  wordBreak(text: string): string[] {
    return text.split(this.charSpace());
  }

  isWordComplete(word: string): boolean {
    word = word || '';
    return word.endsWith(this.charSpace()) || word.endsWith('.') || word.endsWith(',');
  }

  startIndexOfWordAt(index: number, words: string[]): number {
    let startIndex = 0;
    let nextStartIndex = 0;
    for (let word of words) {
      nextStartIndex += word.length + 1;
      if (index < nextStartIndex) break;

      startIndex = nextStartIndex;
    }

    return startIndex;
  }

  lengthOfWordAt(index: number, words: string[]): number {
    let wordLength = words[0].length;
    let startIndex = 0;
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      let word = words[wordIndex];
      startIndex += word.length + 1;
      if (index < startIndex) break;

      wordLength = (words[wordIndex + 1]) ? words[wordIndex + 1].length : 0;
    }

    return wordLength;
  }

  charSpace(): string {
    return ' ';
  }
}
