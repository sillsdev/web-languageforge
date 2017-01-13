var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
sharedb.types.register(richText.type);

function getWebSocketUrl() {
  var url = 'ws://' + window.location.host;
  return (url.endsWith(':8080')) ? url : url + ':8080';
}

// Open WebSocket connection to ShareDB server
var socket = new WebSocket(getWebSocketUrl());
var connection = new sharedb.Connection(socket);

// For testing reconnection
window.disconnect = function() {
  connection.close();
};
window.connect = function() {
  var socket = new WebSocket(getWebSocketUrl());
  connection.bindToSocket(socket);
};

// Connect to both text field
connectDoc('example', 'realTime1');
connectDoc('example', 'realTime2');

// Create local Doc instance mapped to collection document with id
// Potentially, collection could be the dictionary id (not necessary if we use entry id as collection)
// But I don't know if having a collection will make any difference such as reducing computing complexity
function connectDoc(collection, id) {
  var doc = connection.get(collection, id);
  doc.subscribe(function(err) {
    if (err) throw err;

    var textEditorElement = document.getElementById(id);
    if (textEditorElement === null) return;
    var quill = new Quill(textEditorElement);
    var clipboard = textEditorElement.getElementsByClassName("ql-clipboard");
    if (clipboard.length != 0) {
      clipboard[0].hidden = true;
    }

    quill.setContents(doc.data);

    quill.on('text-change', function(delta, oldDelta, source) {
      if (source !== 'user') return;
      doc.submitOp(delta, {source: quill});
    });

    doc.on('op', function(op, source) {
      if (source === quill) return;
      quill.updateContents(op);
    });
  });
}
