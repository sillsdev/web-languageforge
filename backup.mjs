import { execSync, spawn } from "child_process";
import { existsSync, mkdtempSync, rmSync, statSync } from "fs";
import { MongoClient, ObjectId } from "mongodb";
import os from "os";
import path from "path";
import net from "net";

// Expected arguments: first arg is project ID (5dbf805650b51914727e06c4) or URL (http://localhost:8080/app/lexicon/5dbf805650b51914727e06c4)
// Second arg is "qa" or "staging" to copy from staging, "live" or "prod" or "production" to copy from production
// NOTE: You must edit the context names below if they don't match the context names you have (see `kubectl config get-contexts` output)

// ===== EDIT THIS =====

const stagingContext = "dallas-rke";
const prodContext = "aws-rke";

// ===== END of EDIT THIS =====

let defaultContext = stagingContext;
let defaultContextName = "staging";

// Create a temp dir reliably
const tempdir = mkdtempSync(path.join(os.tmpdir(), "lfbackup-"));
let portForwardProcess;
let localConn;
let remoteConn;

async function cleanup() {
  if (existsSync(tempdir)) {
    console.warn(`Cleaning up temporary directory ${tempdir}...`);
    rmSync(tempdir, { recursive: true, force: true });
  }
  if (localConn) await localConn.close();
  if (remoteConn) await remoteConn.close();
  if (portForwardProcess) await portForwardProcess.kill();
}

async function randomFreePort() {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, () => {
      // Asking for port 0 makes Node automatically find a free port
      const port = server.address().port;
      server.close((_) => resolve(port));
    });
  });
}

process.on("exit", cleanup);
process.on("uncaughtExceptionMonitor", cleanup);

function run(cmd) {
  return execSync(cmd).toString().trimEnd();
}

function getContexts() {
  var stdout = run("kubectl config get-contexts -o name");
  return stdout.split("\n");
}

function reallyExists(name) {
  // Sometimes the audio and/or pictures folders in assets are symlinks, and sometimes they're broken symlinks
  // This returns true if the name is a real file/directory *or* a symlink with a valid target, or false if it doesn't exist or is broken
  const result = execSync(
    `kubectl --context=${context} --namespace=languageforge exec -c app deploy/app -- sh -c "readlink -eq ${name} >/dev/null && echo yes || echo no"`,
  )
    .toString()
    .trimEnd();
  if (result === "yes") return true;
  if (result === "no") return false;
  throw new Error(`Unexpected result from readlink ${name}: ${result}`);
}

// Sanity check

var contexts = getContexts();
if (!contexts.includes(stagingContext)) {
  console.warn("Staging context not found. Tried", stagingContext, "but did not find it in", contexts);
  console.warn("Might need to edit the top level of this file and try again");
  process.exit(1);
}
if (!contexts.includes(prodContext)) {
  console.warn("Prod context not found. Tried", prodContext, "but did not find it in", contexts);
  console.warn("Might need to edit the top level of this file and try again");
  process.exit(1);
}

// Process args

if (process.argv.length < 3) {
  console.warn("Please pass project ID or URL as argument, e.g. node backup.mjs 5dbf805650b51914727e06c4");
  process.exit(2);
}

let projId;
const arg = process.argv[2];
if (URL.canParse(arg)) {
  const url = new URL(arg);
  if (url.pathname.startsWith("/app/lexicon/")) {
    projId = url.pathname.substring("/app/lexicon/".length);
  } else {
    projId = url.pathname; // Will probably fail, but worth a try
  }
} else {
  projId = arg;
}

let context = defaultContext;
let contextName = defaultContextName;

if (process.argv.length > 3) {
  const env = process.argv[3];
  switch (env) {
    case "qa":
      context = stagingContext;
      contextName = "staging";
      break;
    case "staging":
      context = stagingContext;
      contextName = "staging";
      break;

    case "live":
      context = prodContext;
      contextName = "production";
      break;
    case "prod":
      context = prodContext;
      contextName = "production";
      break;
    case "production":
      context = prodContext;
      contextName = "production";
      break;

    default:
      console.warn(`Unknown environment ${env}`);
      console.warn(`Valid values are qa, staging, live, prod, or production`);
      process.exit(2);
  }
} else {
  console.warn("No environment selected. Defaulting to staging environment.");
  console.warn('Pass "prod" or "production" as second arg to copy projects from production envrionment instead.');
}

projId = projId.trim();

console.warn(`Fetching project with ID ${projId} from ${contextName} context, named "${context}"`);
console.warn("If that looks wrong, hit Ctrl+C right NOW!");
console.warn();
console.warn("Pausing for 2 seconds to give you time to hit Ctrl+C...");
await new Promise((resolve) => setTimeout(resolve, 2000));
// Start running

console.warn("Setting up kubectl port forwarding for remote Mongo...");
const remoteMongoPort = await randomFreePort();
let portForwardingReady;
const portForwardingPromise = new Promise((resolve) => {
  portForwardingReady = resolve;
});
portForwardProcess = spawn(
  "kubectl",
  [`--context=${context}`, "--namespace=languageforge", "port-forward", "deploy/db", `${remoteMongoPort}:27017`],
  {
    stdio: "pipe",
  },
);
portForwardProcess.stdout.on("data", (data) => {
  portForwardingReady();
});
portForwardProcess.stderr.on("data", (data) => {
  console.warn("Port forwarding failed:");
  console.warn(data.toString());
  console.warn("Exiting");
  process.exit(1);
});

console.warn("Setting up local Mongo connection...");

const localMongoPort = run("docker compose port db 27017").split(":")[1];
const localConnStr = `mongodb://admin:pass@localhost:${localMongoPort}/?authSource=admin`;
localConn = await MongoClient.connect(localConnStr);

const localAdmin = await localConn.db("scriptureforge").collection("users").findOne({ username: "admin" });
const adminId = localAdmin._id.toString();
console.log(`Local admin ID: ${adminId}`);
console.warn("If that doesn't look right, hit Ctrl+C NOW");

await portForwardingPromise;
console.warn("Port forwarding is ready. Setting up remote Mongo connection...");

const remoteConnStr = `mongodb://localhost:${remoteMongoPort}`;
remoteConn = await MongoClient.connect(remoteConnStr);

console.warn("Remote Mongo connection established. Fetching project record...");

// Get project record
const project = await remoteConn
  .db("scriptureforge")
  .collection("projects")
  .findOne({ _id: new ObjectId(projId) });
console.log("Project code:", project.projectCode);

const dbname = `sf_${project.projectCode}`;
project.users = { [adminId]: { role: "project_manager" } };
project.ownerRef = new ObjectId(adminId);

// Mongo removed the .copyDatabase method in version 4.2, whose release notes said to just use mongodump/mongorestore if you want to do that

console.warn(`Copying ${dbname} database...`);
const collections = await remoteConn.db(dbname).collections();
for (const remoteColl of collections) {
  const name = remoteColl.collectionName;
  console.log(`  Copying ${name} collection...`);
  const indexes = await remoteColl.indexes();
  const cursor = remoteColl.find();
  const docs = await cursor.toArray();
  const localColl = await localConn.db(dbname).collection(name);
  try {
    await localColl.drop();
  } catch (_) {} // Throws if collection doesn't exist, which is fine
  try {
    await localColl.dropIndexes();
  } catch (_) {} // Throws if collection doesn't exist, which is fine
  if (indexes?.length) await localColl.createIndexes(indexes);
  if (docs?.length) await localColl.insertMany(docs);
  console.log(`  ${docs.length} documents copied`);
}
console.warn(`${dbname} database successfully copied`);

// Copy project record after its database has been copied, so there's never a race condition where the project exists but its entry database doesn't
console.warn("Copying project record...");
await localConn
  .db("scriptureforge")
  .collection("projects")
  .findOneAndReplace({ _id: new ObjectId(projId) }, project, { upsert: true });

// NOTE: mongodump/mongorestore approach below can be revived once Kubernetes 1.30 is installed on client *and* server, so kubectl exec is finally reliable

// console.warn(`About to try fetching ${dbname} database from remote, will retry until success`);
// let done = false;
// while (!done) {
//   try {
//     console.warn(`Fetching ${dbname} database...`);
//     execSync(
//       `kubectl --context="${context}" --namespace=languageforge exec -i deploy/db -- mongodump --archive -d "${dbname}" > ${tempdir}/dump`,
//     );
//     console.warn(`Uploading to local ${dbname} database...`);
//     execSync(`docker exec -i lf-db mongorestore --archive --drop -d "${dbname}" ${localConnStr} < ${tempdir}/dump`);
//     console.warn(`Successfully uploaded ${dbname} database`);
//     done = true;
//   } catch (err) {
//     console.warn("mongodump failed, retrying...");
//   }
// }

console.warn("Checking that remote assets really exist...");
const includeAudio = reallyExists(`/var/www/html/assets/lexicon/${dbname}/audio`);
const includePictures = reallyExists(`/var/www/html/assets/lexicon/${dbname}/pictures`);
console.log(`Copy audio? ${includeAudio ? "yes" : "no"}`);
console.log(`Copy pictures? ${includePictures ? "yes" : "no"}`);

const filesNeeded = [];
if (includeAudio) {
  filesNeeded.push("audio");
}
if (includePictures) {
  filesNeeded.push("pictures");
}

if (filesNeeded.length === 0) {
  console.warn("Project has no assets. Copy complete.");
  process.exit(0);
}

const tarTargets = filesNeeded.join(" ");

console.warn("Creating assets tarball in remote...");
execSync(
  `kubectl --context="${context}" --namespace=languageforge exec -c app deploy/app -- tar chf /tmp/assets-${dbname}.tar --owner=www-data --group=www-data -C "/var/www/html/assets/lexicon/${dbname}" ${tarTargets}`,
);
const sizeStr = run(
  `kubectl --context="${context}" --namespace=languageforge exec -c app deploy/app -- sh -c "ls -l /tmp/assets-${dbname}.tar | cut -d' ' -f5"`,
);
const correctSize = +sizeStr;
console.warn(`Asserts tarball size is ${sizeStr}`);

console.warn("Getting name of remote app pod...");
const pod = run(
  `kubectl --context="${context}" --namespace=languageforge get pod -o jsonpath="{.items[*]['metadata.name']}" -l app=app --field-selector "status.phase=Running"`,
);
console.warn("Trying to fetch assets tarball with kubectl cp...");
let failed = false;
try {
  execSync(
    `kubectl --context="${context}" --namespace=languageforge cp ${pod}:/tmp/assets-${dbname}.tar ${tempdir}/assets-${dbname}.tar`,
  );
} catch (_) {
  console.warn("kubectl cp failed. Will try to continue with rsync...");
  failed = true;
}
if (!failed) {
  const localSize = statSync(`${tempdir}/assets-${dbname}.tar`).size;
  if (localSize < correctSize) {
    console.warn(`Got only ${localSize} bytes instead of ${correctSize}. Will try to continue with rsync...`);
    failed = true;
  }
}
if (failed) {
  console.warn("Ensuring rsync exists in target container...");
  execSync(
    `kubectl exec --context="${context}" -c app deploy/app -- bash -c "which rsync || (apt update && apt install rsync -y)"`,
  );
  console.warn("\n===== IMPORTANT NOTE =====");
  console.warn(
    "The rsync transfer may (probably will) stall at 100%. You'll have to find the rsync process and kill it. Sorry about that.",
  );
  console.warn("===== IMPORTANT NOTE =====\n");
  let done = false;
  while (!done) {
    try {
      execSync(
        `rsync -v --partial --info=progress2 --rsync-path="/tmp/" --rsh="kubectl --context=${context} --namespace=languageforge exec -i -c app deploy/app -- " "rsync:/tmp/assets-${dbname}.tar" "${tempdir}/"`,
        { stdio: "inherit" }, // Allows us to see rsync progress
      );
      done = true;
    } catch (err) {
      console.warn(`Rsync failed with error: ${err}. Retrying...`);
    }
  }
}
console.warn("Uploading assets tarball to local...");
execSync(
  `docker exec lf-app mkdir -p "/var/www/html/assets/lexicon/${dbname}" ; docker exec lf-app chown www-data:www-data "/var/www/html/assets/lexicon/${dbname}" || true`,
);
execSync(`docker cp - lf-app:/var/www/html/assets/lexicon/${dbname}/ < ${tempdir}/assets-${dbname}.tar`);
console.warn("Assets successfully uploaded");

process.exit(0);
