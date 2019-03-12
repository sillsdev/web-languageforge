var express = require('express');
var http = require('http');
var richText = require('rich-text');
var otJson0 = require('ot-json0');
var ShareDB = require('sharedb');
var ShareDBMongo = require('sharedb-mongo');
var WebSocketJSONStream = require('websocket-json-stream');
var WebSocket = require('ws');

ShareDB.types.register(richText.type);
ShareDB.types.register(otJson0.type);

var backend = null;

// Create web servers to serve files and listen to WebSocket connections
var app = express();
app.use(express.static('static'));
var server = http.createServer(app);

module.exports = {
  start: function(callback, mongo, port) {
    var database = ShareDBMongo(mongo);
    backend = new ShareDB({
      db: database,
      disableDocAction: true,
      disableSpaceDelimitedActions: true
    });

    // Connect any incoming WebSocket connection to ShareDB
    var wss = new WebSocket.Server({ server: server });
    wss.on('connection', function(ws) {
      var stream = new WebSocketJSONStream(ws);
      backend.listen(stream);
    });

    server.on('error', function(err) {
      console.log('Error in Realtime Server:' + err);
      callback(err);
    });
    server.on('listening', function() {
      console.log('Realtime Server is listening on http://localhost:' + port);
      callback();
    });
    server.listen(port);
  },

  stop: function(callback) {
    if (server.listening) {
      callback();
      return;
    }
    server.close(function() {
      backend.close();
      console.log('Realtime Server stopped');
      callback();
    });
  }
};
