var sharedb = require('sharedb/lib/client');
var richText = require('rich-text');
var Quill = require('quill');
sharedb.types.register(richText.type);

function getWebSocketUrl() {
  var url = 'ws://' + window.location.host;
  return (url.endsWith(':8080')) ? url : url + ':8080';
}

function getWebSocketMsgUrl() {
	var url = 'ws://' + window.location.host;
  return (url.endsWith(':8079')) ? url : url + ':8079';
}

// Open WebSocket connection to ShareDB server
var socket = new WebSocket(getWebSocketUrl());
var msgSocket = new WebSocket(getWebSocketMsgUrl());
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

function WordFieldConcat(word, id){
  var a = word.concat('~',id);
  return a;
}

function GetIDfromWordFieldConcat(con){
  var a = con.split('~');
  return a[1];
}

window.realTime = {};
window.realTime.createAndSubscribeDoc = function createAndSubscribeDoc(id, isNgQuill){
  // Connect to both text field
  var wordID = id;
  if (!isNgQuill) {
    var word = document.getElementById(id).parentNode.childNodes[1].innerHTML;
    wordID = WordFieldConcat(word, id);
    document.getElementById(id).id = wordID;
  }
	// console.log(wordID);
  sendCollectionId(JSON.stringify({"b": wordID, "a": "bs", "c": "collection","d": isNgQuill}));
	msgSocket.onmessage = function(event) {
		// console.log("receive message");
		var msg = JSON.parse(event.data);
		if (msg.e == "success") {
  		connectDoc(msg.c, msg.b, msg.d);
		}
	}
}

// Create local Doc instance mapped to collection document with id
// Potentially, collection could be the dictionary id (not necessary if we use entry id as collection)
// But I don't know if having a collection will make any difference such as reducing computing complexity
function connectDoc(collection, id, isNgQuill) {
  isNgQuill = isNgQuill || false;
  var doc = connection.get(collection, id);
	var textEditorElement;
  doc.subscribe(function(err) {
    if (err) throw err;
		console.log(collection,":",id,":",isNgQuill);
    if (isNgQuill) {
			textEditorElement = document.getElementById(id).getElementsByClassName('ql-container')[0];
    } else {
      textEditorElement = document.getElementById(id);
    }
		console.log(textEditorElement);
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