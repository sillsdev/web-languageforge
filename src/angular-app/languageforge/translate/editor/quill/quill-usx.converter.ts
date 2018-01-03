import Quill from 'quill';

import { JsonRpcResult } from '../../../../bellows/core/api/json-rpc.service';
import { UtilityService } from '../../../../bellows/core/utility.service';
import { SourceDocumentEditor, TargetDocumentEditor } from '../document-editor';

export class FormatUsxHtmlAttributes {
  // must assign null value so properties can be iterated over
  id: string = null;
  title: string = null;
}

export class FormatUsx extends FormatUsxHtmlAttributes {
  // must assign null value so properties can be iterated over
  style: string = null;
  number: string = null;
  altnumber: string = null;
  pubnumber: string = null;
  caller: string = null;
  closed: string = null;

  // used to show verse-per-line alignment. Not in USX spec
  'verse-alignment': string = null;
}

export class UsxAttributesAndValuesToKeep {
  // use an empty array to keep any value

  style: string[] = [
    'c', // <chapter>
    'v', // <verse>
    'h', 'p', 's', // <para> https://app.thedigitalbiblelibrary.org/static/docs/usx/parastyles.html
    'f', 'fe', 'ef', // <note> https://app.thedigitalbiblelibrary.org/static/docs/usx/notes.html
    // <note><char> https://app.thedigitalbiblelibrary.org/static/docs/usx/notes.html#char-footnote-style-types
    'fr', 'ft', 'fk', 'fq', 'fqa', 'fl', 'fp', 'fv', 'fdc'
  ];

  // <chapter> and <verse>
  number: string[] = [];
  altnumber: string[] = [];
  pubnumber: string[] = [];

  // <note>
  caller: string[] = [];

  // <note><char>
  closed: string[] = [];

  shouldKeepAnyValue(property: string): boolean {
    return this[property].length === 0;
  }
}

export class QuillUsxConverter {
  static versesOnNewLine(html: string): string {
    return html.replace(/(\/usx-verse>.*?)(<usx-verse )/g, '\$1</usx-para><usx-para data-verse-alignment>\$2');
  }

  static convertFromStringToHtml(usx: string, mimeType: string): JsonRpcResult {
    const result: JsonRpcResult = {
      ok: false,
      data: null
    };
    const parser = new DOMParser();
    const doc = parser.parseFromString(usx, mimeType);
    if (!QuillUsxConverter.isDOMParserError(doc)) {
      const usxAttributesAndValuesToKeep = new UsxAttributesAndValuesToKeep();
      QuillUsxConverter.removeNodes(doc, ['para', 'chapter', 'verse', 'note', 'char']);
      QuillUsxConverter.convertNode(doc, 'para', 'usx-para', usxAttributesAndValuesToKeep);
      QuillUsxConverter.convertNode(doc, 'chapter', 'usx-chapter', usxAttributesAndValuesToKeep, 'number');
      QuillUsxConverter.convertNode(doc, 'verse', 'usx-verse', usxAttributesAndValuesToKeep, 'number');
      QuillUsxConverter.convertNode(doc, 'note', 'usx-note', usxAttributesAndValuesToKeep);
      QuillUsxConverter.convertNode(doc, 'char', 'usx-char', usxAttributesAndValuesToKeep);
      result.ok = true;
    }

    result.data = doc.documentElement.innerHTML;
    return result;
  }

  static removeNodes(doc: Document, nodeNamesToKeep: string[]) {
    let node = doc.documentElement.firstChild;
    while (node) {
      const nextSibling = node.nextSibling;
      if (node.nodeType === Node.ELEMENT_NODE && !nodeNamesToKeep.includes(node.nodeName.toLowerCase())) {
        doc.documentElement.removeChild(node);
      }

      node = nextSibling;
    }
  }

  static alignHtml(source: SourceDocumentEditor, target: TargetDocumentEditor) {
    class InsertHtmlAt {
      constructor(public index: number, public html: string) {}
    }

    const targetInserts: InsertHtmlAt[] = [];
    const sourceInserts: InsertHtmlAt[] = [];
    let targetLine = 0;
    let sourceLine = 0;
    let sourceChildNode = source.quill.root.firstChild;
    let targetChildNode = target.quill.root.firstChild;
    let sourceChild: HTMLElement;
    let targetChild: HTMLElement;
    while (sourceChildNode || targetChildNode) {
      sourceChild = sourceChildNode as HTMLElement;
      targetChild = targetChildNode as HTMLElement;
      if (sourceChild.nodeName !== targetChild.nodeName ||
        sourceChild.getAttribute('data-style') !== targetChild.getAttribute('data-style')
      ) {
        if (sourceChild.nodeName === targetChildNode.nextSibling.nodeName && sourceChild.getAttribute('data-style')
          === (targetChildNode.nextSibling as HTMLElement).getAttribute('data-style')
        ) {
          const index = source.quill.getIndex(source.quill.getLines()[sourceLine]);
          const html = QuillUsxConverter.newLineHtml(targetChild);
          sourceInserts.push(new InsertHtmlAt(index, html));
          targetChildNode = targetChildNode.nextSibling;
          targetLine++;
        } else if (sourceChild.nextSibling.nodeName === targetChildNode.nodeName &&
          (sourceChildNode.nextSibling as HTMLElement).getAttribute('data-style') ===
          targetChild.getAttribute('data-style')
        ) {
          const index = target.quill.getIndex(target.quill.getLines()[targetLine]);
          const html = QuillUsxConverter.newLineHtml(sourceChild);
          targetInserts.push(new InsertHtmlAt(index, html));
          sourceChildNode = sourceChildNode.nextSibling;
          sourceLine++;
        }
      } else {
        sourceChildNode = sourceChildNode.nextSibling;
        targetChildNode = targetChildNode.nextSibling;
        sourceLine++;
        targetLine++;
      }
    }

    for (const insert of targetInserts.reverse()) {
      target.quill.clipboard.dangerouslyPasteHTML(insert.index, insert.html, Quill.sources.USER);
    }

    for (const insert of sourceInserts.reverse()) {
      source.quill.clipboard.dangerouslyPasteHTML(insert.index, insert.html, Quill.sources.USER);
    }
  }

  private static newLineHtml(element: HTMLElement): string {
    const EMPTY_PLACEHOLDER = '\xa0'; // &nbsp;
    const doc = new Document();
    const newNode = doc.createElement(element.nodeName);
    QuillUsxConverter.copyAttributes(element, newNode);
    if (element.firstChild.nodeName.toLowerCase() === 'usx-verse') {
      newNode.innerHTML = (element.firstChild as HTMLElement).outerHTML;
    }
    newNode.innerHTML += EMPTY_PLACEHOLDER;
    return newNode.outerHTML;
  }

  private static convertNode(doc: Document, oldNodeName: string, newNodeName: string,
                             attributesAndValuesToKeep: UsxAttributesAndValuesToKeep,
                             contentAttributeName: string = '') {
    const nodes = [].slice.call(doc.querySelectorAll(oldNodeName)) as HTMLElement[];
    for (const oldNode of nodes) {
      if (QuillUsxConverter.hasAttributesAndValues(oldNode, attributesAndValuesToKeep)) {
        const newNode = doc.createElement(newNodeName);
        newNode.innerHTML = oldNode.innerHTML;
        QuillUsxConverter.AddNoteId(oldNode, newNode);
        for (const key in oldNode.attributes) {
          if (oldNode.attributes.hasOwnProperty(key)) {
            const oldAttribute: Attr = oldNode.attributes[key];
            QuillUsxConverter.copyAttribute(oldAttribute, newNode, attributesAndValuesToKeep, contentAttributeName);
            QuillUsxConverter.addNoteTooltip(oldNode, newNode, oldAttribute);
          }
        }

        oldNode.parentNode.replaceChild(newNode, oldNode);
      } else {
        oldNode.remove();
      }
    }
  }

  private static hasAttributesAndValues(node: HTMLElement,
                                        attributesAndValuesToKeep: UsxAttributesAndValuesToKeep): boolean {
    for (const key in node.attributes) {
      if (node.attributes.hasOwnProperty(key) && attributesAndValuesToKeep.hasOwnProperty(node.attributes[key].name) &&
        attributesAndValuesToKeep[node.attributes[key].name].includes(node.attributes[key].value)
      ) {
        return true;
      }
    }

    return false;
  }

  private static copyAttribute(oldAttribute: Attr, newNode: HTMLElement,
                               attributesAndValuesToKeep: UsxAttributesAndValuesToKeep,
                               contentAttributeName: string): void {
    if (contentAttributeName !== '' && oldAttribute.name === contentAttributeName) {
      newNode.textContent = oldAttribute.value;
    } else if (!attributesAndValuesToKeep.hasOwnProperty(oldAttribute.name) ||
      attributesAndValuesToKeep.shouldKeepAnyValue(oldAttribute.name) ||
      attributesAndValuesToKeep[oldAttribute.name].includes(oldAttribute.value)
    ) {
      const name = (attributesAndValuesToKeep.hasOwnProperty(oldAttribute.name)) ?
        'data-' + oldAttribute.name : oldAttribute.name;
      newNode.setAttribute(name, oldAttribute.value);
    }
  }

  private static AddNoteId(oldNode: HTMLElement, newNode: HTMLElement): void {
    if (oldNode.nodeName === 'note' && !oldNode.getAttribute('id')) {
      // FixMe: use UtilityService.uuid() after change to static method - IJH 2017-11
      const date = new Date();
      const uniqueId = '_note_' + date.getSeconds() + date.getMilliseconds();
      newNode.setAttribute('id', uniqueId); // UtilityService.uuid());
    }
  }

  private static addNoteTooltip(oldNode: HTMLElement, newNode: HTMLElement, oldAttribute: Attr): void {
    if (oldAttribute.name === 'style' && oldAttribute.value === 'fr') {
      let tooltip = '';
      const siblings = [].slice.call(oldNode.parentNode.childNodes) as HTMLElement[];
      for (const sibling of siblings) {
        if (sibling.hasAttribute('style') && sibling.getAttribute('style') === 'fq') {
          tooltip += sibling.textContent;
        }
      }
      for (const sibling of siblings) {
        if (sibling.hasAttribute('style') && sibling.getAttribute('style') === 'ft') {
          tooltip += sibling.textContent;
        }
      }
      newNode.setAttribute('title', tooltip);
    }
  }

  private static copyAttributes(oldNode: HTMLElement, newNode: HTMLElement) {
    for (const key in oldNode.attributes) {
      if (oldNode.attributes.hasOwnProperty(key)) {
        newNode.setAttribute(oldNode.attributes[key].name, oldNode.attributes[key].value);
      }
    }
  }

  private static isDOMParserError(doc: Document) {
    return doc.querySelectorAll('parsererror').length > 0;
  }
}
