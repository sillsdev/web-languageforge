var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
var db = require('sharedb-mongo')('mongodb://localhost:27017/operations');

ShareDB.types.register(richText.type);
var backend = new ShareDB({db: db});
var connection = backend.connect();

startServer();

// Create initial document then fire callback
function createDoc(collection, id) {
  var doc = connection.get(collection, id);
  doc.fetch(function(err) {
    if (err) throw err;
    if (doc.type === null) {
      doc.create([{insert: ''}], 'rich-text');
    }
  });
}

function startServer() {
  // Create a web server to serve files and listen to WebSocket connections
  var app = express();
  app.use(express.static('static'));
  app.use(express.static('node_modules/quill/dist'));
  var docServer = http.createServer(app);
  var messageServer = http.createServer(app);
  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: docServer});
  var wss2 = new WebSocket.Server({server: messageServer});
  wss2.on('connection', function(ws, req) {
    ws.on('message', function(msg) {
      var JSONMsg = JSON.parse(msg);
      if (typeof(JSONMsg.b) == "string") {
        createDoc(JSONMsg.c,JSONMsg.b);
        ws.send(JSON.stringify({"a": "bs", "b": JSONMsg.b, "c": JSONMsg.c, "d": JSONMsg.d, "e": "success"}));
      } else if (typeof(JSONMsg.b) == "object") {
        for (var i = 0; i<JSONMsg.b.length; i++) {      
          createDoc(JSONMsg.c,JSONMsg.b[i]);
          ws.send(JSON.stringify({"a": "bs", "b": JSONMsg.b, "c": JSONMsg.c, "d": JSONMsg.d, "e": "success"}));
        }
      }
    });
  });
  wss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  docServer.listen(8080);
  messageServer.listen(8079);
  console.log('Message server listening on http://localhost:8079');
  console.log('Doc server listening on http://localhost:8080');
}

function getJsonObjFromFile(sessionId){
  if(sessionId == null || sessionId == ""){
    return false;
  }
  var tmpDir = "/tmp";
  var filePath = tmpDir.concat("/jsonSessionData/", sessionId, ".json");
  try{
    var jsonObj = require(filePath);
  } catch (e) {
      return false;
  }
  return jsonObj;
}

//getJsonObjFromFile("t8vcdm2gb2235a88ps696liv35");
