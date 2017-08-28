import Quill, { TextChangeHandler } from 'quill';

interface DocCallback { (error: any): void }
interface OnOpsFunction { (op: any, source: any): void }

export declare class RealTimeDoc {
  type: string;
  id: string;
  data: any;
  fetch(callback: DocCallback): void;
  subscribe(callback: DocCallback): void;
  ingestSnapshot(snapshot: any, callback: DocCallback): void;
  destroy(): void;
  on(eventName: string, onOpsFunction: OnOpsFunction): void;
  create(data: any[], type?: string, options?: any, callback?: DocCallback): void;
  submitOp(op: any, options?: any, callback?: DocCallback): void;
  del(options?: any, callback?: DocCallback): void;
  whenNothingPending(callback: DocCallback): void;
  removeListener(eventName: string, onOpsFunction: OnOpsFunction): void;
}

export class RealTimeService {
  private readonly ShareDB = require('sharedb/lib/client');
  private readonly richText = require('rich-text');

  // Open WebSocket connection to ShareDB server
  private readonly socket = new WebSocket(RealTimeService.getWebSocketDocUrl());
  private readonly connection = new this.ShareDB.Connection(this.socket);

  private docSubs: { [id: string]: RealTimeDoc } = {};
  private onTextChanges: { [id: string]: TextChangeHandler } = {};
  private onOps: { [id: string]: OnOpsFunction } = {};

  constructor() {
    this.ShareDB.types.register(this.richText.type);
  }

  createAndSubscribeRichTextDoc(collection: string, id: string, quill: Quill) {
    let doc: RealTimeDoc;
    if (id in this.docSubs) {
      doc = this.docSubs[id];
      this.disconnectRichTextDoc(id, quill);
    } else {
      collection = collection || 'collection';
      doc = this.connection.get(collection, id);
      doc.fetch((err) => {
        if (err) throw err;

        if (doc.type === null) {
          doc.create([{insert: ''}], this.richText.type.name);
        }
      });
    }

    this.docSubs[id] = doc;
    doc.subscribe((err) => {
      if (err) throw err;

      quill.setContents(doc.data);

      this.onTextChanges[id] = function (delta: any, oldDelta: any, source: any) {
        if (source !== Quill.sources.USER) return;
        doc.submitOp(delta, {source: quill});

        // console.log('onTextChange: docId', id, 'data', quill.getText());
      };

      quill.on(Quill.events.TEXT_CHANGE, this.onTextChanges[id]);

      this.onOps[id] = function (op: any, source: any) {
        if (source === quill) return;
        quill.updateContents(op);

        // console.log('onOp: docId', id, 'data', quill.getText());
      };

      doc.on('op', this.onOps[id]);
    });
  };

  updateRichTextDoc(collection: string = 'collection', id: string, delta: any, source: any) {
    let doc: RealTimeDoc;
    if (id in this.docSubs) {
      doc = this.docSubs[id];
      doc.submitOp(delta, {source: source});
    } else {
      doc = this.connection.get(collection, id);
      doc.fetch((err) => {
        if (err) throw err;

        if (doc.type === null) {
          doc.create([{insert: ''}], this.richText.type.name);
        } else {
          doc.submitOp(delta, {source: source});
        }
      });
    }
  };

  disconnectRichTextDoc(id: string, quill: Quill) {
    if (id in this.onTextChanges) {
      quill.off(Quill.events.TEXT_CHANGE, this.onTextChanges[id]);
      delete this.onTextChanges[id];
    }

    if (id in this.docSubs) {
      if (id in this.onOps) {
        this.docSubs[id].removeListener('op', this.onOps[id]);
        delete this.onOps[id];
      }

      this.docSubs[id].destroy();
      delete this.docSubs[id];
    }
  };

  private static getWebSocketDocUrl() {
    let url = 'wss://' + window.location.host;
    return (url.endsWith(':8443')) ? url : url + ':8443';
  }

}
