var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
// var db = require('sharedb-mongo')('mongodb://localhost:27017/operations');

ShareDB.types.register(richText.type);
// var backend = new ShareDB({db: db});
var backend = new ShareDB();
var connection = backend.connect();

// Client connection time allowed without editing in minutes
var connectionTime = 20;

startServer();

// Create initial document then fire callback
function createDoc(collection, id, value) {
  value = value || '';
  var doc = connection.get(collection, id);
  doc.fetch(function(err) {
    if (err) throw err;

    if (doc.type === null) {
      doc.create([{insert: value}], 'rich-text');
    }
  });
}

// Check if object is empty
function isEmpty(object) {
  for(var key in object) {
    if(object.hasOwnProperty(key))
      return false;
  }
  return true;
}

// Disconnect document
function docDisconnect(docIds, receivedBytes, agent) {
  if (receivedBytes == agent.stream.ws.bytesReceived) {
    var streams = backend.pubsub.streams;
    for (var fieldId in streams) {
      if (streams.hasOwnProperty(fieldId)) {
        for (var docId in docIds) {
          if (docIds.hasOwnProperty(docId) && streams[fieldId].hasOwnProperty(docId)) {
            delete streams[fieldId][docId];
          }
        }
        if (isEmpty(streams[fieldId])) {
          if (streams.hasOwnProperty(fieldId)) {
            delete streams[fieldId];
          }
          var sub = backend.pubsub.subscribed;
          if (sub.hasOwnProperty(fieldId)) {
            delete sub[fieldId];
          }
        }
      }
    }
  } else {
    receivedBytes = agent.stream.ws.bytesReceived;
    setTimeout(function () {
      docDisconnect(docIds, receivedBytes, agent);
    }, connectionTime*1000);
  }
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  app.use(express.static('node_modules/quill/dist'));
  var docServer = http.createServer(app);
  var messageServer = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var docWss = new WebSocket.Server({server: docServer});
  var messageWss = new WebSocket.Server({server: messageServer});
  messageWss.on('connection', function(ws, req) {
    ws.on('message', function(msg) {
      var JsonMsg = JSON.parse(msg);
      if (typeof(JsonMsg.b) == 'string') {
        createDoc(JsonMsg.c, JsonMsg.b, JsonMsg.d);
        ws.send(JSON.stringify({'a': 'bs', 'b': JsonMsg.b, 'c': JsonMsg.c, 'd': JsonMsg.d, 'e': 'success'}));
      } else if (typeof(JsonMsg.b) == 'object') {
        for (var i = 0; i<JsonMsg.b.length; i++) {
          createDoc(JsonMsg.c, JsonMsg.b[i], JsonMsg.d);
          ws.send(JSON.stringify({'a': 'bs', 'b': JsonMsg.b, 'c': JsonMsg.c, 'd': JsonMsg.d, 'e': 'success'}));
        }
      }
    });
  });

  docWss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    var agent = backend.listen(stream);
    setTimeout(function(){
      var collection = agent.subscribedDocs.collection;
      var docIds = [];
      for (var key in collection) {
        if (collection.hasOwnProperty(key)) {
          docIds.push(collection[key].id);
        }
      }
      docDisconnect(docIds, -1, agent);
    }, 1500);
  });

  docServer.listen(8080);
  messageServer.listen(8079);
  console.log('Message server listening on http://localhost:8079');
  console.log('Doc server listening on http://localhost:8080');
}

function getJsonObjFromFile(sessionId){
  if (sessionId == null || sessionId == '') return false;

  var tmpDir = '/tmp';
  var filePath = tmpDir + '/jsonSessionData/' + sessionId + '.json';
  try {
    var jsonObj = require(filePath);
  } catch (e) {
      return false;
  }
  return jsonObj;
}

// getJsonObjFromFile('t8vcdm2gb2235a88ps696liv35');
