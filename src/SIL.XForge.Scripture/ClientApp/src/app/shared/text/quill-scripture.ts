import Parchment from 'parchment';
import Quill, { Clipboard, DeltaOperation, DeltaStatic } from 'quill';

const Delta: new () => DeltaStatic = Quill.import('delta');

class UsxFormat {
  static readonly KEYS = new Set<string>(['style', 'altnumber', 'pubnumber', 'caller', 'closed']);

  style?: string;
  altnumber?: string;
  pubnumber?: string;
  caller?: string;
  closed?: string;
}

class Note {
  index: number;
  delta: { ops: DeltaOperation[] };
}

export function registerScripture(): void {
  const QuillClipboard = Quill.import('modules/clipboard') as typeof Clipboard;
  const QuillParchment = Quill.import('parchment') as typeof Parchment;
  const Inline = Quill.import('blots/inline') as typeof Parchment.Inline;
  const Block = Quill.import('blots/block') as typeof Parchment.Block;
  const Scroll = Quill.import('blots/scroll') as typeof Parchment.Scroll;
  const Embed = Quill.import('blots/embed') as typeof Parchment.Embed;
  const BlockEmbed = Quill.import('blots/block/embed') as typeof Parchment.Embed;

  const customAttributeName = (key: string) => 'data-' + key;

  function setFormatUsx(node: HTMLElement, format: UsxFormat): void {
    if (format) {
      for (const key in format) {
        if (format.hasOwnProperty(key) && format[key] != null && typeof format[key] === 'string') {
          node.setAttribute(customAttributeName(key), format[key]);
        }
      }
    }
  }

  function createFormatUsx(node: HTMLElement): UsxFormat {
    const format = new UsxFormat();
    for (const key of UsxFormat.KEYS) {
      if (node.hasAttribute(customAttributeName(key))) {
        format[key] = node.getAttribute(customAttributeName(key));
      }
    }

    return format;
  }

  // zero width space
  const ZWSP = '\u200b';
  // non-breaking space
  const NBSP = '\u00A0';

  class VerseEmbed extends Embed {
    static blotName = 'verse';
    static tagName = 'usx-verse';

    static create(value: string): Node {
      const node = super.create(value) as HTMLElement;
      // add a ZWSP before the verse number, so that it allows breaking
      node.innerText = ZWSP + value;
      return node;
    }

    static formats(node: HTMLElement): any {
      return { verse: createFormatUsx(node) };
    }

    static value(node: HTMLElement): any {
      return node.innerText.trim().substring(1);
    }

    format(name: string, value: any): void {
      if (name === 'verse') {
        const format = value as UsxFormat;
        const elem = this.domNode as HTMLElement;
        setFormatUsx(elem, format);
      } else {
        super.format(name, value);
      }
    }
  }

  class BlankEmbed extends Embed {
    static blotName = 'blank';
    static tagName = 'usx-blank';

    static create(value: string): Node {
      const node = super.create(value) as HTMLElement;
      node.setAttribute(customAttributeName('type'), value);
      let text: string;
      switch (value) {
        case 'initial':
          text = NBSP;
          break;
        case 'normal':
          text = NBSP.repeat(8);
          break;
      }
      node.innerText = text;
      return node;
    }

    static value(node: HTMLElement): any {
      return node.getAttribute(customAttributeName('type'));
    }
  }

  class CharInline extends Inline {
    static blotName = 'char';
    static tagName = 'usx-char';

    static create(value: UsxFormat): Node {
      const node = super.create(value) as HTMLElement;
      setFormatUsx(node, value);
      return node;
    }

    static formats(node: HTMLElement): UsxFormat {
      return createFormatUsx(node);
    }

    static value(node: HTMLElement): UsxFormat {
      return createFormatUsx(node);
    }
  }

  class NoteEmbed extends Embed {
    static blotName = 'note';
    static tagName = 'usx-note';

    private static readonly VALUE_KEY = '__note_value';

    static create(value: Note): Node {
      const node = super.create(value) as HTMLElement;
      node.innerText = String.fromCharCode(0x61 + value.index);
      node.title = value.delta.ops.reduce((text, op) => text + op.insert, '');
      node[NoteEmbed.VALUE_KEY] = value;
      return node;
    }

    static formats(node: HTMLElement): any {
      return { note: createFormatUsx(node) };
    }

    static value(node: HTMLElement): Note {
      return node[NoteEmbed.VALUE_KEY];
    }

    format(name: string, value: any): void {
      if (name === 'note') {
        const format = value as UsxFormat;
        const elem = this.domNode as HTMLElement;
        if (format.caller != null) {
          elem.innerText = format.caller;
        }
        setFormatUsx(elem, format);
      } else {
        super.format(name, value);
      }
    }
  }

  Block.allowedChildren.push(VerseEmbed);
  Block.allowedChildren.push(BlankEmbed);
  Block.allowedChildren.push(NoteEmbed);

  class ParaBlock extends Block {
    static blotName = 'para';
    static tagName = 'usx-para';

    static create(value: UsxFormat): Node {
      const node = super.create(value) as HTMLElement;
      setFormatUsx(node, value);
      return node;
    }

    static formats(node: HTMLElement): UsxFormat {
      return createFormatUsx(node);
    }

    static value(node: HTMLElement): UsxFormat {
      return createFormatUsx(node);
    }

    format(name: string, value: any): void {
      if (UsxFormat.KEYS.has(name)) {
        this.domNode.setAttribute(customAttributeName(name), value);
      } else {
        super.format(name, value);
      }
    }
  }

  class ChapterEmbed extends BlockEmbed {
    static blotName = 'chapter';
    static tagName = 'usx-chapter';

    static create(value: string): Node {
      const node = super.create(value) as HTMLElement;
      node.innerText = value;
      node.contentEditable = 'false';
      return node;
    }

    static formats(node: HTMLElement): any {
      return { chapter: createFormatUsx(node) };
    }

    static value(node: HTMLElement): string {
      return node.innerText;
    }

    format(name: string, value: any): void {
      if (name === 'chapter') {
        const format = value as UsxFormat;
        const elem = this.domNode as HTMLElement;
        setFormatUsx(elem, format);
      } else {
        super.format(name, value);
      }
    }
  }

  Scroll.allowedChildren.push(ParaBlock);
  Scroll.allowedChildren.push(ChapterEmbed);

  const HighlightClass = new QuillParchment.Attributor.Class('highlight', 'highlight', {
    scope: Parchment.Scope.INLINE
  });

  const SegmentClass = new QuillParchment.Attributor.Attribute('segment', 'data-segment', {
    scope: Parchment.Scope.INLINE
  });

  class DisableHtmlClipboard extends QuillClipboard {
    onPaste(e: ClipboardEvent): void {
      if (e.defaultPrevented || !this.quill.isEnabled()) {
        return;
      }
      const range = this.quill.getSelection();
      let delta = new Delta().retain(range.index);
      const scrollTop = this.quill.scrollingContainer.scrollTop;
      this.container.focus();
      this.quill.selection.update('silent');

      const text = e.clipboardData.getData('text/plain');
      setTimeout(() => {
        this.container.innerHTML = text;
        delta = delta.concat(this.convert()).delete(range.length);
        this.quill.updateContents(delta, 'user');
        // range.length contributes to delta.length()
        this.quill.setSelection(delta.length() - range.length, 'silent');
        this.quill.scrollingContainer.scrollTop = scrollTop;
        this.quill.focus();
      }, 1);
    }
  }

  Quill.register('attributors/class/highlight', HighlightClass);
  Quill.register('attributors/attribute/segment', SegmentClass);
  Quill.register('formats/highlight', HighlightClass);
  Quill.register('formats/segment', SegmentClass);
  Quill.register('blots/verse', VerseEmbed);
  Quill.register('blots/blank', BlankEmbed);
  Quill.register('blots/note', NoteEmbed);
  Quill.register('blots/char', CharInline);
  Quill.register('blots/para', ParaBlock);
  Quill.register('blots/chapter', ChapterEmbed);
  Quill.register('blots/scroll', Scroll, true);
  Quill.register('modules/clipboard', DisableHtmlClipboard, true);
}
