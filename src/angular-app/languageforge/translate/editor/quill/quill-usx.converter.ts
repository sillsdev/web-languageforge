export class FormatUsxHtmlAttributes {
  // must assign null value so properties can be iterated over
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

  static convertFromStringToHtml(usx: string, mimeType: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(usx, mimeType);
    const usxAttributesAndValuesToKeep = new UsxAttributesAndValuesToKeep();
    QuillUsxConverter.convertNode(doc, 'book', '', usxAttributesAndValuesToKeep);
    QuillUsxConverter.convertNode(doc, 'para', 'usx-para', usxAttributesAndValuesToKeep);
    QuillUsxConverter.convertNode(doc, 'chapter', 'usx-chapter', usxAttributesAndValuesToKeep, 'number');
    QuillUsxConverter.convertNode(doc, 'verse', 'usx-verse', usxAttributesAndValuesToKeep, 'number');
    QuillUsxConverter.convertNode(doc, 'note', 'usx-note', usxAttributesAndValuesToKeep);
    QuillUsxConverter.convertNode(doc, 'char', 'usx-char', usxAttributesAndValuesToKeep);
    console.log(doc);

    return doc.documentElement.innerHTML;
  }

  private static convertNode(doc: Document, oldTagName: string, newTagName: string,
                             attributesAndValuesToKeep: UsxAttributesAndValuesToKeep,
                             contentAttributeName: string = '') {
    const nodes = [].slice.call(doc.querySelectorAll(oldTagName)) as HTMLElement[];
    for (const oldNode of nodes) {
      if (QuillUsxConverter.hasAttributesAndValues(oldNode, attributesAndValuesToKeep)) {
        const newNode = doc.createElement(newTagName);
        newNode.innerHTML = oldNode.innerHTML;
        for (const key in oldNode.attributes) {
          if (oldNode.attributes.hasOwnProperty(key)) {
            if (contentAttributeName !== '' && oldNode.attributes[key].name === contentAttributeName) {
              newNode.textContent = oldNode.attributes[key].value;
            } else if (!attributesAndValuesToKeep.hasOwnProperty(oldNode.attributes[key].name) ||
              attributesAndValuesToKeep.shouldKeepAnyValue(oldNode.attributes[key].name) ||
              attributesAndValuesToKeep[oldNode.attributes[key].name].includes(oldNode.attributes[key].value)
            ) {
              const name = (attributesAndValuesToKeep.hasOwnProperty(oldNode.attributes[key].name)) ?
                'data-' + oldNode.attributes[key].name : oldNode.attributes[key].name;
              newNode.setAttribute(name, oldNode.attributes[key].value);
              QuillUsxConverter.addNoteTooltip(oldNode, newNode, key);
            }
          }
        }

        // FixMe: If <note> has no text content it is removed completely including attributes we want to round-trip.
        // Perhaps stop quill from 'optimizing' nested spans. - IJH 2017-11
        // if (oldTagName === 'note' && QuillUsxConverter.getTextWithoutChildren(oldNode) === '') {
        //   newNode.innerHTML = '\xa0' + oldNode.innerHTML; // &nbsp;
        // }

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

  private static addNoteTooltip(oldNode: HTMLElement, newNode: HTMLElement, key: string): void {
    if (oldNode.attributes[key].name === 'style' && oldNode.attributes[key].value === 'fr') {
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

  // https://stackoverflow.com/questions/9340449/
  // is-there-a-way-to-get-innertext-of-only-the-top-element-and-ignore-the-child-el
  private static getTextWithoutChildren(node: HTMLElement) {
    let child = node.firstChild;
    const texts: string[] = [];

    while (child) {
      if (child.nodeType === child.TEXT_NODE) {
        texts.push((child as Text).data);
      }
      child = child.nextSibling;
    }

    return texts.join('');
  }
}
