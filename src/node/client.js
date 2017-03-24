var ShareDB = require('sharedb/lib/client');
var richText = require('rich-text');
ShareDB.types.register(richText.type);

// Open WebSocket connection to ShareDB server
var socket = new WebSocket(getWebSocketDocUrl());
var connection = new ShareDB.Connection(socket);

var docSubs = {};
var onTextChanges = {};
var onOps = {};
var realTime = {};

function getWebSocketDocUrl() {
  var url = 'wss://' + window.location.host;
  return (url.endsWith(':8443')) ? url : url + ':8443';
}

realTime.createAndSubscribeRichTextDoc =
  function createAndSubscribeRichTextDoc(collection, id, quill) {
    var doc;
    if (id in docSubs) {
      doc = docSubs[id];
      realTime.disconnectRichTextDoc(id, quill);
    } else {
      collection = collection || 'collection';
      doc = connection.get(collection, id);
      doc.fetch(function (err) {
        if (err) throw err;

        if (doc.type === null) {
          doc.create([{ insert: '' }], richText.type.name);
        }
      });
    }

    docSubs[id] = doc;
    doc.subscribe(function (err) {
      if (err) throw err;

      quill.setContents(doc.data);

      onTextChanges[id] = function (delta, oldDelta, source) {
        if (source !== Quill.sources.USER) return;
        doc.submitOp(delta, { source: quill });

        // console.log('onTextChange: docId', id, 'data', quill.getText());
      };

      quill.on(Quill.events.TEXT_CHANGE, onTextChanges[id]);

      onOps[id] = function (op, source) {
        if (source === quill) return;
        quill.updateContents(op);

        // console.log('onOp: docId', id, 'data', quill.getText());
      };

      doc.on('op', onOps[id]);
    });
  };

realTime.updateRichTextDoc = function updateRichTextDoc(collection, id, delta, source) {
  var doc;
  if (id in docSubs) {
    doc = docSubs[id];
    doc.submitOp(delta, { source: source });
  } else {
    collection = collection || 'collection';
    doc = connection.get(collection, id);
    doc.fetch(function (err) {
      if (err) throw err;

      if (doc.type === null) {
        doc.create([{ insert: '' }], richText.type.name);
      } else {
        doc.submitOp(delta, { source: source });
      }
    });
  }
};

realTime.disconnectRichTextDoc = function disconnectRichTextDoc(id, quill) {
  if (id in onTextChanges) {
    quill.off(Quill.events.TEXT_CHANGE, onTextChanges[id]);
    delete onTextChanges[id];
  }

  if (id in docSubs) {
    if (id in onOps) {
      docSubs[id].removeListener('op', onOps[id]);
      delete onOps[id];
    }

    docSubs[id].destroy();
    delete docSubs[id];
  }
};

exports.realTime = realTime;
