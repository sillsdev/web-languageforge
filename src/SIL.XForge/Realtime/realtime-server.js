const express = require('express');
const http = require('http');
const richText = require('rich-text');
const otJson0 = require('ot-json0');
const ShareDB = require('sharedb');
const ShareDBMongo = require('sharedb-mongo');
const WebSocketJSONStream = require('websocket-json-stream');
const WebSocket = require('ws');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const jwt = require('jsonwebtoken');
const jwks = require('jwks-rsa');
const shareDBAccess = require('sharedb-access');

ShareDB.types.register(richText.type);
ShareDB.types.register(otJson0.type);

// This should stay in sync with the corresponding enum in "Models/Operation.cs".
const Operation = {
  Create: 1,
  Edit: 2,
  Delete: 3,
  View: 4,

  EditOwn: 5,
  DeleteOwn: 6,
  ViewOwn: 7
};

function isLocalRequest(request) {
  const addr = request.connection.remoteAddress;
  return addr === '127.0.0.1' || addr === '::ffff:127.0.0.1' || addr === '::1';
}

function deepGet(path, obj) {
  let curValue = obj;
  for (let i = 0; i < path.length; i++) {
    curValue = curValue[path[i]];
  }
  return curValue;
}

class RealtimeServer {
  constructor(options) {
    this.connectionString = options.connectionString;
    this.port = options.port;
    this.projectsCollectionName = options.projectsCollectionName;
    this.projectRoles = new Map();
    for (const role of options.projectRoles) {
      this.projectRoles.set(role.name, new Set(role.rights));
    }

    // Create web servers to serve files and listen to WebSocket connections
    const app = express();
    app.use(express.static('static'));
    this.httpServer = http.createServer(app);

    this.jwksClient = jwks({
      cache: true,
      jwksUri: `${options.origin}.well-known/openid-configuration/jwks`
    });

    this.backend = new ShareDB({
      db: ShareDBMongo(this.connectionString),
      disableDocAction: true,
      disableSpaceDelimitedActions: true
    });
    this.backend.use('connect', (request, done) => {
      this.setConnectSession(request)
        .then(() => done())
        .catch(err => done(err));
    });
    this.backend.use('apply', (request, done) => {
      this.setProjectId(request)
        .then(() => done())
        .catch(err => done(err));
    });

    shareDBAccess(this.backend);
    this.collections = new Map();
    for (const collectionConfig of options.collections) {
      this.addDataAccessRules(collectionConfig);
      this.collections.set(collectionConfig.name, collectionConfig.metadataName);
    }

    // Connect any incoming WebSocket connection to ShareDB
    const wss = new WebSocket.Server({
      server: this.httpServer,
      verifyClient: (info, done) => this.verifyToken(info, done)
    });
    wss.on('connection', ws => {
      const stream = new WebSocketJSONStream(ws);
      this.backend.listen(stream, ws.upgradeReq);
    });
  }

  async init() {
    this.database = await MongoClient.connect(this.connectionString);
  }

  start() {
    return new Promise((resolve, reject) => {
      this.httpServer.once('error', err => {
        console.log('Error in Realtime Server:' + err);
        reject(err);
      });
      this.httpServer.once('listening', () => {
        console.log('Realtime Server is listening on http://localhost:' + this.port);
        resolve();
      });
      this.httpServer.listen(this.port);
    });
  }

  stop() {
    if (!this.httpServer.listening) {
      return;
    }

    this.database.close();
    this.backend.close();
    this.httpServer.close();
    console.log('Realtime Server stopped.');
  }

  getKey(header, done) {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        done(err);
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        done(null, signingKey);
      }
    });
  }

  verifyToken(info, done) {
    const url = info.req.url;
    if (url.includes('?access_token=')) {
      const token = url.split('?access_token=')[1];
      jwt.verify(
        token,
        (header, done) => this.getKey(header, done),
        (err, decoded) => {
          if (err) {
            done(false, 401, 'Unauthorized');
          } else {
            info.req.user = decoded;
            done(true);
          }
        }
      );
    } else if (isLocalRequest(info.req)) {
      done(true);
    } else {
      done(false, 401, 'Unauthorized');
    }
  }

  async updateUserProjectRoles(session) {
    const coll = this.database.collection(this.projectsCollectionName);
    const projects = await coll.find({ 'users.userRef': new ObjectId(session.userId) }).toArray();
    const projectRoles = new Map();
    for (const project of projects) {
      const projectUser = project.users.find(pu => pu.userRef.equals(session.userId));
      projectRoles.set(project._id.toHexString(), projectUser.role);
    }
    session.projectRoles = projectRoles;
  }

  async setConnectSession(request) {
    if (request.req.user != null) {
      const session = { userId: request.req.user.sub, isServer: false };
      await this.updateUserProjectRoles(session);
      request.agent.connectSession = session;
    } else {
      request.agent.connectSession = { isServer: true };
    }
  }

  async getProjectId(collectionName, docId) {
    const metadataName = this.collections.get(collectionName);
    const coll = this.database.collection(metadataName);
    const parts = docId.split(':');
    const text = await coll.findOne({ _id: new ObjectId(parts[0]) });
    return text == null ? '' : text.projectRef.toHexString();
  }

  async setProjectId(request) {
    if (request.op.create) {
      const projectId = await this.getProjectId(request.collection, request.id);
      request.snapshot.m.projectRef = projectId;
    }
  }

  async getUserProjectRole(session, projectId) {
    let projectRole = session.projectRoles.get(projectId);
    if (projectRole == null) {
      await this.updateUserProjectRoles(session);
      projectRole = session.projectRoles.get(projectId);
    }
    return projectRole;
  }

  addDataAccessRules(collectionConfig) {
    this.backend.allowCreate(collectionConfig.name, (_docId, _doc, session) => {
      return session.isServer;
    });
    this.backend.allowDelete(collectionConfig.name, (_docId, _doc, session) => {
      return session.isServer;
    });
    this.backend.allowRead(collectionConfig.name, async (docId, _doc, session) => {
      if (session.isServer) {
        return true;
      }

      const projectId = await this.getProjectId(collectionConfig.name, docId);
      if (projectId === '') {
        return false;
      }
      const role = await this.getUserProjectRole(session, projectId);
      if (role == null) {
        return false;
      }

      for (const type of collectionConfig.types) {
        if (!this.hasRight(role, type.domain, Operation.View)) {
          return false;
        }
      }
      return true;
    });
    this.backend.allowUpdate(collectionConfig.name, async (_docId, oldDoc, newDoc, ops, session, request) => {
      if (session.isServer) {
        return true;
      }

      const projectId = request.snapshot.m.projectRef;
      const role = await this.getUserProjectRole(session, projectId);
      if (role == null) {
        return false;
      }

      switch (collectionConfig.otTypeName) {
        case richText.type.name:
          if (!this.hasRight(role, collectionConfig.types[0].domain, Operation.Edit)) {
            return false;
          }
          break;

        case otJson0.type.name:
          for (const op of ops) {
            const type = this.getMatchingType(collectionConfig, op.p);
            if (type == null) {
              return false;
            }

            if (type.path.length < op.p.length) {
              // property update
              const entityPath = op.p.slice(0, type.path.length);
              const oldEntity = deepGet(entityPath, oldDoc);
              const newEntity = deepGet(entityPath, newDoc);
              if (!this.checkJsonEditRight(session.userId, role, type, oldEntity, newEntity)) {
                return false;
              }
            } else if (op.li != null && op.ld != null) {
              // replace
              if (!this.checkJsonEditRight(session.userId, role, type, op.ld, op.li)) {
                return false;
              }
            } else if (op.li != null) {
              // create
              if (!this.checkJsonCreateRight(session.userId, role, type, op.li)) {
                return false;
              }
            } else if (op.ld != null) {
              // delete
              if (!this.checkJsonDeleteRight(session.userId, role, type, op.ld)) {
                return false;
              }
            }
          }
          break;
      }
      return true;
    });
  }

  hasRight(role, domain, operation) {
    const rights = this.projectRoles.get(role);
    return rights.has(domain + operation);
  }

  checkJsonEditRight(userId, role, type, oldEntity, newEntity) {
    if (oldEntity.ownerRef !== newEntity.ownerRef) {
      return false;
    }

    if (this.hasRight(role, type.domain, Operation.Edit)) {
      return true;
    }

    return this.hasRight(role, type.domain, Operation.EditOwn) && oldEntity.ownerRef === userId;
  }

  checkJsonCreateRight(userId, role, type, newEntity) {
    return this.hasRight(role, type.domain, Operation.Create) && newEntity.ownerRef === userId;
  }

  checkJsonDeleteRight(userId, role, type, oldEntity) {
    if (this.hasRight(role, type.domain, Operation.Delete)) {
      return true;
    }

    return this.hasRight(role, type.domain, Operation.DeleteOwn) && oldEntity.ownerRef === userId;
  }

  getMatchingType(collectionConfig, path) {
    for (const type of collectionConfig.types) {
      if (path.length < type.path.length) {
        continue;
      }

      let match = true;
      for (let i = 0; i < type.path.length; i++) {
        if (type.path[i] === '$') {
          if (typeof path[i] != 'number') {
            match = false;
            break;
          }
        } else if (type.path[i] !== path[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return type;
      }
    }
    return null;
  }
}

module.exports = {
  start: (callback, options) => {
    server = new RealtimeServer(options);
    server
      .init()
      .then(() => server.start())
      .then(() => callback())
      .catch(err => callback(err));
  },

  stop: callback => {
    if (server) {
      server.stop();
    }
    callback();
  }
};
