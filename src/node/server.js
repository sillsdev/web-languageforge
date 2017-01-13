var http = require('http');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');

ShareDB.types.register(richText.type);
var backend = new ShareDB();
var connection = backend.connect();

startServer();

// Set up documents for listening
createDoc('example', 'realTime1');
createDoc('example', 'realTime2');

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
  var server = http.createServer(app);

  // Connect any incoming WebSocket connection to ShareDB
  var wss = new WebSocket.Server({server: server});
  wss.on('connection', function(ws, req) {
    var stream = new WebSocketJSONStream(ws);
    backend.listen(stream);
  });

  server.listen(8080);
  console.log('Listening on http://localhost:8080');
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
