var fs = require('fs');
var https = require('https');
var express = require('express');
var ShareDB = require('sharedb');
var richText = require('rich-text');
var WebSocket = require('ws');
var WebSocketJSONStream = require('websocket-json-stream');
var database = require('sharedb-mongo')('mongodb://localhost:27017/realtime');
var MongoClient = require('mongodb').MongoClient;

ShareDB.types.register(richText.type);
var backend = new ShareDB({ db: database });
var connection = backend.connect();

var config = require('./serverConfig');
var defaultKey = '/etc/letsencrypt/live/cat.languageforge.org/privKey.pem';
var defaultCert = '/etc/letsencrypt/live/cat.languageforge.org/cert.pem';
var sslKeyPath = config.sslKeyPath || defaultKey;
var sslCertPath = config.sslCertPath || defaultCert;
var webSocketDocServerPort = 8443;
var webSocketMessageServerPort = 8442;

// Client connection time allowed without editing in minutes
var connectionTime = 20;

startServer();

MongoClient.connect('mongodb://localhost:27017/realtime', function (err, db) {
  if (!err) {
    console.log('Connected to MongoDB');
  }

  //Example code getting collections out of a database
  db.collection('collection').find({}).toArray(function (err, docs) {
    // console.log('Found the following records', docs);
  });
});

// Create initial document then fire callback
function createDoc(collection, id, value) {
  value = value || '';
  var doc = connection.get(collection, id);
  doc.fetch(function (err) {
    if (err) throw err;

    if (doc.type === null) {
      doc.create([{ insert: value }], 'rich-text');
    }
  });
}

// Check if object is empty
function isEmpty(object) {
  for (var key in object) {
    if (object.hasOwnProperty(key))
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
    }, connectionTime * 1000);
  }
}

function startServer() {
  // Create web servers to serve files and listen to WebSocket connections
  var privateKey  = fs.readFileSync(sslKeyPath, 'utf8');
  var certificate = fs.readFileSync(sslCertPath, 'utf8');
  var options = { key: privateKey, cert: certificate };
  var app = express();
  app.use(express.static('static'));
  app.use(express.static('node_modules/quill/dist'));
  var docServer = https.createServer(options, app);
  var messageServer = https.createServer(options, app);

  // Connect any incoming WebSocket connection to ShareDB
  var docWss = new WebSocket.Server({ server: docServer });
  var messageWss = new WebSocket.Server({ server: messageServer });
  messageWss.on('connection', function (ws) {
    ws.on('message', function (jsonMsg) {
      var msg = JSON.parse(jsonMsg);
      if (typeof (msg.docId) == 'string') {
        createDoc(msg.collection, msg.docId, msg.initialValue);
        msg.result = 'docReady';
        ws.send(JSON.stringify(msg));
      }
    });
  });

  docWss.on('connection', function (ws) {
    var stream = new WebSocketJSONStream(ws);
    var agent = backend.listen(stream);
    setTimeout(function () {
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

  docServer.listen(webSocketDocServerPort, function () {
    console.log((new Date()) + ' Doc Server is listening on port ' + webSocketDocServerPort);
  });

  messageServer.listen(webSocketMessageServerPort, function () {
    console.log((new Date()) + ' Message Server is listening on port ' +
      webSocketMessageServerPort);
  });
}

//noinspection JSUnusedLocalSymbols
function getJsonObjFromFile(sessionId) {
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
