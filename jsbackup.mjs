// TODO: Rename to backup.mjs before committing

import { exec, execSync, spawn } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "fs";
import { MongoClient, ObjectId } from "mongodb";
import os from "os";
import path from "path";

// ===== EDIT THIS =====

const stagingContext = "dallas-rke";
const prodContext = "aws-rke";

// Choose one, comment out the other
const context = stagingContext;
// const context = prodContext

// ===== END of EDIT THIS =====

// Create a temp dir reliably
const tempdir = mkdtempSync(path.join(os.tmpdir(), "lfbackup-"));

const cleanup = () => {
  console.error(`Cleaning up temporary directory ${tempdir}...`);
  if (existsSync(tempdir)) {
    rmSync(tempdir, { recursive: true, force: true });
  }
};

process.on("exit", cleanup);

function run(cmd) {
  return execSync(cmd).toString().trimEnd();
}

function getContexts() {
  var stdout = run("kubectl config get-contexts -o name");
  return stdout.split("\n");
}

function localSpawn(cmd, opts = {}) {
  return spawn(`docker exec -i lf-db ${cmd}`, opts);
}

function localExec(cmd, opts = {}) {
  return execSync(`docker exec -i lf-db ${cmd}`, opts);
}

function remoteSpawn(cmd, opts = {}) {
  return spawn(`kubectl --context="${context}" exec -i deploy/db -- ${cmd}`, opts);
}
function remoteExec(cmd, opts = {}) {
  console.log("Running: ", `kubectl --context="${context}" exec -i deploy/db -- ${cmd}`);
  return execSync(`kubectl --context="${context}" exec -i deploy/db -- ${cmd}`, opts);
}
// Sanity check

var contexts = getContexts();
if (!contexts.includes(stagingContext)) {
  console.log("Staging context not found. Tried", stagingContext, "but did not find it in", contexts);
  console.log("Might need to edit the top level of this file and try again");
  process.exit(1);
}
if (!contexts.includes(prodContext)) {
  console.log("Prod context not found. Tried", prodContext, "but did not find it in", contexts);
  console.log("Might need to edit the top level of this file and try again");
  process.exit(1);
}

// Start running

// TODO: Improve by finding a local port that's not in use, rather than hardcoding this
let portForwardingReady;
const portForwardingPromise = new Promise((resolve) => {
  portForwardingReady = resolve;
});
const portForwardProcess = spawn("kubectl", [`--context=${context}`, "port-forward", "svc/db", "27018:27017"], {
  stdio: "pipe",
});
portForwardProcess.stdout.on("data", (data) => {
  portForwardingReady();
});
portForwardProcess.stderr.on("data", (data) => {
  console.log("Port forwarding failed:");
  console.log(data.toString());
  console.log("Exiting");
  process.exit(1);
});

const localMongoPort = run("docker compose port db 27017").split(":")[1];
const localConnStr = `mongodb://admin:pass@localhost:${localMongoPort}/?authSource=admin`;
const localConn = await MongoClient.connect(localConnStr);

const localAdmin = await localConn.db("scriptureforge").collection("users").findOne({ username: "admin" });
const adminId = localAdmin._id.toString();
console.log("Local admin ID:", adminId);

// await portForwardingPromise
const remoteConnStr = `mongodb://localhost:27018`;
const remoteConn = await MongoClient.connect(remoteConnStr);

const remoteAdmin = await remoteConn.db("scriptureforge").collection("users").findOne({ username: "admin" });
console.log("Remote admin ID:", remoteAdmin._id.toString());

// Get project record

const projId = "5dbf805650b51914727e06c4"; // TODO: Get from argv
const project = await remoteConn
  .db("scriptureforge")
  .collection("projects")
  .findOne({ _id: new ObjectId(projId) });
console.log("Project code:", project.projectCode);

const dbname = `sf_${project.projectCode}`;
project.users = { [adminId]: { role: "project_manager" } };
project.ownerRef = new ObjectId(adminId);
console.log(project.users);
delete project._id; // Otherwise Mongo complains that we're trying to alter it, which is dumb

console.log("Copying project record...");
await localConn
  .db("scriptureforge")
  .collection("projects")
  .findOneAndReplace({ _id: projId }, project, { upsert: true });

// Mongo removed the .copyDatabase method in version 4.2, whose release notes said to just use mongodump/mongorestore if you want to do that

console.log(`Fetching ${dbname} database...`);
remoteExec(`mongodump --archive -d "${dbname}" > ${tempdir}/dump`);
localExec(`mongorestore --archive --drop -d "${dbname}" ${localConnStr} < ${tempdir}/dump`);

console.log("Setting up rsync on target container...");
execSync(
  `kubectl exec --context="${context}" deploy/app -- bash -c "which rsync || (apt update && apt install rsync -y)"`,
);

console.log("Fetching assets via rsync (and retrying until success)...");
console.log("\n===== IMPORTANT NOTE =====");
console.log(
  "If this stalls at exactly 50% done, then it's really 100% done and hasn't realized it. Just hit Ctrl+C and it will succeed on the retry",
);
console.log("===== IMPORTANT NOTE =====\n");

// NOTE: Hitting Ctrl+C worked in the bash script, but here it kills the Node process rather than being passed through to rsync
// TODO: Find a way to handle the "kill rsync and retry" thing gracefully, or else find a different solution than rsync

mkdirSync(`${tempdir}/assets/${dbname}`, { recursive: true });
let done = false;
while (!done) {
  try {
    execSync(
      `rsync -rLt --partial --info=progress2 --blocking-io --rsync-path="/var/www/html/assets/lexicon/${dbname}" --rsh="kubectl --context=${context} exec -i deploy/app -- " "rsync:/var/www/html/assets/lexicon/${dbname}/" "${tempdir}/assets/${dbname}/"`,
      { stdio: "inherit" },
    );
    done = true;
  } catch (err) {
    console.log(`Rsync failed with error: ${err}. Retrying...`);
  }
}

await localConn.close();
await remoteConn.close();
await portForwardProcess.kill();
