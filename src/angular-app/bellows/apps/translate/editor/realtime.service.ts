import * as angular from 'angular';
import Quill, { TextChangeHandler } from 'quill';
import * as RichText from 'rich-text';
import { Connection, Doc, OnOpsFunction, types } from 'sharedb/lib/client';

import { DocumentCacheData, DocumentsOfflineCacheService } from '../../../core/offline/documents-offline-cache.service';
import { SaveState } from '../core/constants';

export class RealTimeService {
  private readonly socket: WebSocket;
  private readonly connection: Connection;

  private docSubs: { [id: string]: Doc } = {};
  private onTextChanges: { [id: string]: TextChangeHandler } = {};
  private onOps: { [id: string]: OnOpsFunction } = {};

  private pendingOpCount: { [id: string]: number } = {};

  static $inject = ['$window', '$q',
    'documentsOfflineCache'];
  constructor(private readonly $window: angular.IWindowService, private readonly $q: angular.IQService,
              private readonly docsOfflineCache: DocumentsOfflineCacheService) {
    types.register(RichText.type);
    // Open WebSocket connection to ShareDB server
    this.socket = new WebSocket(this.getWebSocketDocUrl());
    this.connection = new Connection(this.socket);
  }

  getSaveState(id: string): SaveState {
    if (!(id in this.pendingOpCount)) {
      return SaveState.Unedited;
    } else if (this.pendingOpCount[id] > 0) {
      return SaveState.Saving;
    } else {
      return SaveState.Saved;
    }
  }

  createAndSubscribeRichTextDoc(collection: string, id: string, quill: Quill): angular.IPromise<void> {
    let doc: Doc;
    if (id in this.docSubs) {
      doc = this.docSubs[id];
      this.disconnectRichTextDoc(id, quill);
    } else {
      doc = this.connection.get(collection, id);
      this.docSubs[id] = doc;
    }

    const deferred = this.$q.defer<void>();
    if (DocumentsOfflineCacheService.canCache()) {
      this.docsOfflineCache.getDocument(id)
        .then(docData => {
          if (docData != null) {
            doc.ingestSnapshot(docData, err => {
              if (err) {
                deferred.reject(err);
              }
              this.subscribe(id, doc, quill, deferred);
            });
          } else {
            this.fetchOrCreate(id, doc, quill, deferred);
          }
        }).catch(() => this.fetchOrCreate(id, doc, quill, deferred));
    } else {
      this.fetchOrCreate(id, doc, quill, deferred);
    }
    return deferred.promise;
  }

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

      delete this.pendingOpCount[id];
    }
    // Quill seems to load a doc faster if the editor is empty, but we don't want to fire any events, which can mess
    // up DocumentEditor state
    quill.setText('', Quill.sources.SILENT);
  }

  private getWebSocketDocUrl() {
    let protocol: string;
    switch (this.$window.location.protocol) {
      case 'http:':
        protocol = 'ws';
        break;
      case 'https:':
        protocol = 'wss';
        break;
    }
    return protocol + '://' + this.$window.location.host + '/sharedb/';
  }

  private fetchOrCreate(id: string, doc: Doc, quill: Quill, deferred: angular.IDeferred<void>): void {
    doc.fetch(err => {
      if (err) {
        deferred.reject(err);
      }

      if (doc.type === null) {
        doc.create([{ insert: '' }], RichText.type.name, { source: quill }, createErr => {
          if (createErr) {
            deferred.reject(createErr);
          }
          this.updateDocumentCache(doc);
          this.subscribe(id, doc, quill, deferred);
        });
      } else {
        this.updateDocumentCache(doc);
        this.subscribe(id, doc, quill, deferred);
      }
    });
  }

  private subscribe(id: string, doc: Doc, quill: Quill, deferred: angular.IDeferred<void>): void {
    doc.subscribe(err => {
      if (err) {
        deferred.reject(err);
      }

      quill.setContents(doc.data);
      quill.getModule('history').clear();

      this.onTextChanges[id] = (delta: any, oldDelta: any, source: any) => {
        if (source !== Quill.sources.USER) return;
        if (!(id in this.pendingOpCount)) {
          this.pendingOpCount[id] = 0;
        }
        this.pendingOpCount[id]++;
        doc.submitOp(delta, { source: quill }, () => {
          this.pendingOpCount[id]--;
          this.updateDocumentCache(doc);
        });
      };

      quill.on(Quill.events.TEXT_CHANGE, this.onTextChanges[id]);

      this.onOps[id] = (op: any, source: any) => {
        if (source === quill) return;
        quill.updateContents(op);
        this.updateDocumentCache(doc);
      };

      doc.on('op', this.onOps[id]);
      deferred.resolve();
    });
  }

  private updateDocumentCache(doc: Doc): void {
    if (!DocumentsOfflineCacheService.canCache()) {
      return;
    }

    const docData: DocumentCacheData = {
      id: doc.id,
      v: doc.version,
      data: doc.data,
      type: doc.type.name
    };
    this.docsOfflineCache.updateDocument(docData);
  }

}
