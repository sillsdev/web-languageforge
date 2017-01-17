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

function sendCollectionId(message) {
  waitForConnection(function () {
    socket.send(message);
  }, 100);
}

function waitForConnection(callback) {
  if (socket.readyState === 1) {
    callback();
  } else {
    setTimeout(function () {
      waitForConnection(callback);
    });
  }
}

function WordFieldConcat(word, id){
  var a = word.concat('~',id);
  return a;
}

function GetIDfromWordFieldConcat(con){
  var a = con.split('~');
  return a[1];
}

window.createAndSubscribeDoc = function createAndSubscribeDoc(id, isNgQuill){
  // Connect to both text field
  var wordID = id;
  if (!isNgQuill) {
    var word = document.getElementById(id).parentNode.childNodes[1].innerHTML;
    wordID = WordFieldConcat(word, id);
    document.getElementById(id).id = wordID;
  }
  sendCollectionId(JSON.stringify({"b": wordID, "a": "bs", "c": "collection"}));
  connectDoc("collection", wordID, isNgQuill);
}

function getWordIDTest(id){

}

function getWordIDReal(id){

}

// Create local Doc instance mapped to collection document with id
// Potentially, collection could be the dictionary id (not necessary if we use entry id as collection)
// But I don't know if having a collection will make any difference such as reducing computing complexity
function connectDoc(collection, id, isNgQuill) {
  isNgQuill = isNgQuill || false;
  var doc = connection.get(collection, id);
  doc.subscribe(function(err) {
    if (err) throw err;

    if (isNgQuill) {
      var textEditorElement = document.querySelector("#" + id + " .ql-container");
    } else {
      var textEditorElement = document.getElementById(id);
    }

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