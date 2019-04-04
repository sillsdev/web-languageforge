export class TextJsonDataId {
  constructor(public readonly textId: string, public readonly chapter: number) {}

  toString(): string {
    return getTextJsonDataIdStr(this.textId, this.chapter);
  }
}

export function getTextJsonDataIdStr(textId: string, chapter: number): string {
  return `${textId}:${chapter}`;
}
