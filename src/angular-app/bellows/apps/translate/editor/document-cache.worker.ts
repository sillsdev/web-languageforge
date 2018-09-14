import * as localforage from 'localforage';
import * as RichText from 'rich-text';
import { Connection, types } from 'sharedb/lib/client';

types.register(RichText.type);

// Open WebSocket connection to ShareDB server
const socket = new WebSocket(getWebSocketDocUrl());
const connection = new Connection(socket);
const store = localforage.createInstance({ name: 'documents' });

addEventListener('message', event => {
  const projectId = event.data.projectId as string;
  const collection = event.data.slug as string;
  const docSetIds = event.data.docSetIds as string[];
  // update documents in cache
  for (const docSetId of docSetIds) {
    updateDocumentCache(collection, docSetId, 'source', projectId);
    updateDocumentCache(collection, docSetId, 'target', projectId);
  }
  // remove deleted documents from cache
  const toRemove: string[] = [];
  store.iterate<any, any>(value => {
    if (value.projectId === projectId && !docSetIds.includes(getDocSetId(value.id))) {
      toRemove.push(value.id);
    }
  }).then(() => {
    for (const docId of toRemove) {
      store.removeItem(docId).then(() => console.log('Removed document ' + docId + ' from cache'));
    }
  });
});

function getWebSocketDocUrl(): string {
  let protocol: string;
  switch (location.protocol) {
    case 'http:':
      protocol = 'ws';
      break;
    case 'https:':
      protocol = 'wss';
      break;
  }
  return protocol + '://' + location.host + '/sharedb/';
}

function updateDocumentCache(collection: string, docSetId: string, docType: string, projectId: string): void {
  const docId = docSetId + ':' + docType;
  const doc = connection.get(collection, docId);
  doc.fetch(err => {
    if (err) {
      return;
    }

    store.setItem(docId, { id: docId, projectId, v: doc.version, data: doc.data, type: doc.type.name })
      .then(() => console.log('Updated document ' + docId + ' in cache'));
  });
}

function getDocSetId(docId: string): string {
  const index = docId.indexOf(':');
  return docId.substr(0, index);
}
