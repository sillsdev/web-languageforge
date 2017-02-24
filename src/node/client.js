var ShareDB = require('sharedb/lib/client');
var richText = require('rich-text');
ShareDB.types.register(richText.type);

function getWebSocketDocUrl() {
  var url = 'wss://' + window.location.host;
  return (url.endsWith(':8443')) ? url : url + ':8443';
}

function getWebSocketMsgUrl() {
  var url = 'wss://' + window.location.host;
  return (url.endsWith(':8442')) ? url : url + ':8442';
}

// Open WebSocket connection to ShareDB server
var socket = new WebSocket(getWebSocketDocUrl());
var msgSocket = new WebSocket(getWebSocketMsgUrl());
var connection = new ShareDB.Connection(socket);
var quillEditors = {};
var docSubs = {};
var onTextChanges = {};
var onOps = {};
var realTime = {};

msgSocket.onmessage = function (event) {
  var msg = JSON.parse(event.data);
  if (msg.result == 'docReady') {
    connectRichTextDoc(msg.collection, msg.docId, quillEditors[msg.docId]);
  }
};

function sendServerMessage(message) {
  waitForConnection(function () {
    msgSocket.send(message);
  });
}

function waitForConnection(callback) {
  if (msgSocket.readyState === 1) {
    callback();
  } else {
    setTimeout(function () {
      waitForConnection(callback);
    }, 100);
  }
}

realTime.createAndSubscribeRichTextDoc =
  function createAndSubscribeRichTextDoc(projectCollection, id, quill) {
    projectCollection = projectCollection || 'collection';
    quillEditors[id] = quill;
    if (!(id in docSubs)) {
      sendServerMessage(JSON.stringify({
        collection: projectCollection, docId: id, initialValue: quill.getText()
      }));
    } else {
      connectRichTextDoc(projectCollection, id, quill);
    }
  };

function connectRichTextDoc(collection, id, quill) {
  var doc;
  if (!(id in docSubs)) {
    doc = connection.get(collection, id);
    docSubs[id] = doc;
  } else {
    doc = docSubs[id];
    realTime.disconnectRichTextDoc(id);
    docSubs[id] = doc;
  }

  doc.subscribe(function (err) {
    if (err) throw err;

    quill.setContents(doc.data);

    onTextChanges[id] = function (delta, oldDelta, source) {
      if (source !== 'user') return;
      doc.submitOp(delta, { source: quill });

      // console.log('onTextChange: docId', id, 'data', quillEditors[id].getText());
    };

    quill.on('text-change', onTextChanges[id]);

    onOps[id] = function (op, source) {
      if (source === quill) return;
      quill.updateContents(op);

      // console.log('onOp: docId', id, 'data', quillEditors[id].getText());
    };

    doc.on('op', onOps[id]);
  });
}

realTime.disconnectRichTextDoc = function disconnectRichTextDoc(id) {
  quillEditors[id].off('text-change', onTextChanges[id]);
  delete onTextChanges[id];

  docSubs[id].removeListener('op', onOps[id]);
  delete onOps[id];
  docSubs[id].destroy();
  delete docSubs[id];
};

exports.realTime = realTime;
