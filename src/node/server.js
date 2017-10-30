var cookie = require('cookie');
var express = require('express');
var fs = require('fs');
var https = require('https');
var MongoClient = require('mongodb').MongoClient;
var os = require('os');
var path = require('path');
var richText = require('rich-text');
var ShareDB = require('sharedb');
var database = require('sharedb-mongo')('mongodb://localhost:27017/realtime');
var WebSocketJSONStream = require('websocket-json-stream');
var WebSocket = require('ws');

ShareDB.types.register(richText.type);

var share = new ShareDB({ db: database });

// Expose the session from initial connection as agent.phpSessionId.
share.use('connect', function (request, done) {
  if (request.req) {
    request.agent.phpSessionId = request.req.phpSessionId;
  }

  done();
});

share.use('apply', useUserData);
share.connect();

var config = (fs.existsSync('./config.js')) ? require('./config') : {};
var defaultSslKey = '/etc/letsencrypt/live/cat.languageforge.org/privkey.pem';
var defaultSslCert = '/etc/letsencrypt/live/cat.languageforge.org/cert.pem';
var sslKeyPath = config.sslKeyPath || defaultSslKey;
var sslCertPath = config.sslCertPath || defaultSslCert;
var hostname = '0.0.0.0';
var webSocketDocServerPort = 8443;

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

function startServer() {
  // Create web servers to serve files and listen to WebSocket connections
  var privateKey  = fs.readFileSync(sslKeyPath, 'utf8');
  var certificate = fs.readFileSync(sslCertPath, 'utf8');
  var options = { key: privateKey, cert: certificate };
  var app = express();
  app.use(express.static('static'));
  var docServer = https.createServer(options, app);

  // Connect any incoming WebSocket connection to ShareDB
  var docWss = new WebSocket.Server({ server: docServer });
  docWss.on('connection', function (ws) {
    getSession(ws, function (err, session) {
      if (err) return console.log(err);

      ws.upgradeReq.session = session;
      var stream = new WebSocketJSONStream(ws);
      var agent = share.listen(stream, ws.upgradeReq);

      // Commented - disconnect is not well tested. IJH 2017-09
      // setTimeout(function () {
      //   var collection = agent.subscribedDocs.collection;
      //   var docIds = [];
      //   for (var key in collection) {
      //     if (collection.hasOwnProperty(key)) {
      //       docIds.push(collection[key].id);
      //     }
      //   }
      //
      //   docDisconnect(docIds, -1, agent);
      // }, 1500);

    });

  });

  docServer.listen(webSocketDocServerPort, hostname, function () {
    console.log('Doc Server is listening at https://' + hostname + ':' + webSocketDocServerPort);
  });
}

// Gets the current session from a WebSocket connection.
function getSession(ws, callback) {
  if (ws.upgradeReq.headers.cookie) {
    const cookies = cookie.parse(ws.upgradeReq.headers.cookie);
    ws.upgradeReq.phpSessionId = cookies.PHPSESSID;
  }

  callback();
}

function useUserData(request, callback) {
  // Get the id of the currently logged in user from the session.
  var userId = '';
  const session = getSessionJsonObjFromFile(request.agent.phpSessionId);

  // noinspection EqualityComparisonWithCoercionJS
  if (session && session.userId != null) {
    userId = session.userId;
  }

  if (userId) {
    request.op.m.u = userId;
  }

  callback();
}

function getSessionJsonObjFromFile(sessionId) {
  if (sessionId === null || sessionId === '') return false;

  var filePath = path.join(os.tmpdir(), 'jsonSessionData', sessionId + '.json');
  try {
    var jsonObj = require(filePath);
  } catch (e) {
    return false;
  }

  return jsonObj;
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
  if (receivedBytes === agent.stream.ws.bytesReceived) {
    var streams = share.pubsub.streams;
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

          var sub = share.pubsub.subscribed;
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
