#!/usr/bin/env python3
"""Inspect, and finish, migrations for the batch scripts in this directory.

    migration_batch_helper.py probe  CODE [--with lexbox,custom-fields] [-- MIGRATION-OPTIONS]
    migration_batch_helper.py finish CODE [-- MIGRATION-OPTIONS]

Used by migrate_custom_field_projects.sh and migrate_non_custom_field_projects.sh, which run on the
host. This runs where copy_project_for_migration.py runs -- inside the app container -- and imports
it, so the Mongo connection, the file paths, the LexBox client and the custom field logic are all
the migration script's own rather than copies of them. MIGRATION-OPTIONS are the options the batch
script passes through to the migration script (--lexbox-host, --suffix, ...), parsed by its own
parse_args so that both see the same values.

probe changes nothing. It prints key=value lines describing the source project and its copy (as
counted the same way as the projectsWorthMigrating lists: entries and comments not marked as
deleted), the copy's Send/Receive state and assets, and whether a migration of this project is
running right now. --with adds the slower checks: "lexbox" logs in to LexBox and asks whether the
copy's project code is taken, and "custom-fields" works out how many custom field definitions the
migration would write, by calling the same functions the migration does.

finish does the last two steps of a migration whose first Send/Receive has completed: move the
staged assets into the Send/Receive work tree, and run the second Send/Receive. Both are the
migration script's own functions, and both are safe to repeat: link_assets_into_webwork skips what
is already linked. It exists because `copy_project_for_migration.py --resume` clears the work tree
before it starts, which after the assets have been moved there would delete them.
"""

from __future__ import annotations

import json
import os
import sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import copy_project_for_migration as m  # noqa: E402

EXTRAS = frozenset({"lexbox", "custom-fields"})

# Counts both projects the way the projectsWorthMigrating lists were counted, so the numbers can be
# compared directly. isEmpty is the one scan_custom_field_usage() uses, so "has custom field data"
# means the same thing here as it does to the migration.
PROBE_JS = r"""
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value === "";
  if (typeof value === "object") {
    if (Object.prototype.hasOwnProperty.call(value, "values")) return (value.values || []).length === 0;
    if (Object.prototype.hasOwnProperty.call(value, "value")) return value.value === null || value.value === "";
    return Object.keys(value).every(function (k) { return isEmpty(value[k]); });
  }
  return false;
}

function holderHasCustomData(holder) {
  const fields = (holder || {}).customFields || {};
  return Object.keys(fields).some(function (name) { return !isEmpty(fields[name]); });
}

function entryHasCustomData(entry) {
  if (holderHasCustomData(entry)) return true;
  return (entry.senses || []).some(function (sense) {
    if (!sense || typeof sense !== "object") return false;
    if (holderHasCustomData(sense)) return true;
    return (sense.examples || []).some(function (example) {
      return example && typeof example === "object" && holderHasCustomData(example);
    });
  });
}

const mainDb = db.getSiblingDB(mainDbName);
const result = {};
Object.keys(sides).forEach(function (side) {
  const code = sides[side][0];
  const dbName = sides[side][1];
  const r = { exists: 0, id: "", sr: "", app: "", last_synced: 0,
              collections: 0, entries: 0, comments: 0, cf_entries: 0 };

  const doc = mainDb.projects.findOne({ projectCode: code });
  if (doc !== null) {
    r.exists = 1;
    r.id = doc._id.toString();
    r.sr = doc.sendReceiveProjectIdentifier || "";
    r.app = doc.appName || "";
    const synced = doc.lastSyncedDate;
    if (synced instanceof Date && !isNaN(synced.getTime())) r.last_synced = synced.getTime();
  }

  const target = db.getSiblingDB(dbName);
  const names = target.getCollectionNames();
  r.collections = names.length;
  if (names.indexOf("lexicon") !== -1) {
    target.lexicon.find({ isDeleted: { $ne: true } }, { customFields: 1, senses: 1 }).forEach(function (entry) {
      r.entries += 1;
      if (entryHasCustomData(entry)) r.cf_entries += 1;
    });
  }
  if (names.indexOf("lexiconComments") !== -1) {
    r.comments = target.lexiconComments.countDocuments({ isDeleted: { $ne: true } });
  }
  result[side] = r;
});
print(EJSON.stringify(result));
"""


def parse_cli(argv: list[str]) -> tuple[str, str, set[str], object]:
    if len(argv) < 2 or argv[0] not in ("probe", "finish"):
        raise SystemExit(__doc__)
    command, code, rest = argv[0], argv[1], argv[2:]
    extras: set[str] = set()
    if rest[:1] == ["--with"]:
        if len(rest) < 2:
            raise SystemExit("--with needs a comma-separated list: " + ", ".join(sorted(EXTRAS)))
        extras = {item for item in rest[1].split(",") if item}
        unknown = extras - EXTRAS
        if unknown:
            raise SystemExit(f"--with: unknown check(s) {', '.join(sorted(unknown))}")
        rest = rest[2:]
    if rest[:1] == ["--"]:
        rest = rest[1:]
    return command, code, extras, m.parse_args([code, *rest])


def mongo_state(config: m.Config, code: str, new_code: str) -> dict:
    sides = {
        "source": [code, m.database_name(code)],
        "copy": [new_code, m.database_name(new_code)],
    }
    js = (
        f"const mainDbName = {json.dumps(config.database)};\n"
        f"const sides = {json.dumps(sides)};\n"
        + PROBE_JS
    )
    return m.mongosh_json(config, js, what=f"Inspecting {code} and {new_code}")


def send_receive_state(config: m.Config, new_code: str) -> dict:
    """The copy's LfMerge state file, classified the way wait_for_send_receive() classifies it."""
    out = {
        "sr_state": "",
        "sr_class": "none",
        "sr_state_mtime": 0,
        "queue_present": int(os.path.exists(config.queue_file(new_code))),
    }
    state, mtime = m.read_sr_state(config, new_code)
    if mtime is None:
        return out
    out["sr_state_mtime"] = int(mtime)
    sr_state = (state or {}).get("SRState") or ""
    out["sr_state"] = sr_state
    if sr_state in m.SR_IN_PROGRESS:
        out["sr_class"] = "in_progress"
    elif sr_state in m.SR_DONE:
        out["sr_class"] = "done"
    elif sr_state in m.SR_FAILED:
        out["sr_class"] = "failed"
    else:
        # Includes a state file LfMerge is part-way through writing, which reads as no state.
        out["sr_class"] = "unknown"
    return out


def asset_state(config: m.Config, app: str, new_code: str) -> dict:
    """Whether link_assets_into_webwork() has run: each asset folder a symlink into the work tree."""
    assets_dir = config.assets_path(app, m.database_name(new_code))
    out: dict[str, object] = {}
    links = correct = newest = 0
    for subfolder, linked_subfolder in m.ASSET_LINKED_FILES:
        path = os.path.join(assets_dir, subfolder)
        if os.path.islink(path):
            kind = "link"
            links += 1
            newest = max(newest, int(os.lstat(path).st_mtime))
            expected = os.path.join(config.linked_files_path(new_code), linked_subfolder)
            if os.path.realpath(path) == os.path.realpath(expected):
                correct += 1
        elif os.path.isdir(path):
            kind = "dir"
        elif os.path.exists(path):
            kind = "other"
        else:
            kind = "missing"
        out[f"assets_{subfolder}"] = kind
    out["assets_links"] = links
    out["assets_all_linked"] = int(correct == len(m.ASSET_LINKED_FILES))
    out["assets_link_mtime"] = newest
    return out


def migration_running(code: str) -> bool:
    """True if this container is running a migration, or a finish, of this project right now.

    The batch scripts start these through `docker compose exec -T`, and interrupting the client does
    not stop the process inside the container, so a rerun has to look for one before it starts.
    """
    me = os.getpid()
    helper = os.path.basename(__file__)
    for entry in os.listdir("/proc"):
        if not entry.isdigit() or int(entry) == me:
            continue
        try:
            with open(f"/proc/{entry}/cmdline", "rb") as handle:
                argv = [arg.decode("utf-8", "replace") for arg in handle.read().split(b"\0") if arg]
        except OSError:
            continue
        if code not in argv:
            continue
        names = {os.path.basename(arg) for arg in argv}
        if "copy_project_for_migration.py" in names:
            return True
        if helper in names and "finish" in argv:
            return True
    return False


def custom_field_counts(config: m.Config, code: str) -> dict:
    """What the migration would decide about custom fields, from the same functions it uses.

    The writing system lists only steer the wsSelector inside a definition, never whether there is
    one, so empty lists give the same count as the migration's own.
    """
    rows = m.describe_custom_fields(
        m.fetch_custom_fields(config, code),
        m.scan_custom_field_usage(config, m.database_name(code)),
    )
    renames, problems = m.plan_custom_field_renames(rows)
    m.apply_custom_field_renames(rows, renames)
    definitions, dropped = m.plan_custom_field_definitions(rows, [], [])
    return {
        "custom_field_definitions": len(definitions),
        "custom_field_case_problems": len(problems),
        # Left out of the definitions but holding data: LfMerge would skip that data, and the
        # migration does not stop for it.
        "custom_fields_dropped_with_data": sum(1 for row, _reason in dropped if row["entries"] > 0),
    }


def lexbox_has_project(args, lexbox_code: str) -> bool:
    """Ask LexBox whether the project code is taken (GET /api/project/projectCodeAvailable/{code})."""
    password = (
        args.lexbox_password
        if args.lexbox_password is not None
        else os.environ.get("LEXBOX_PASSWORD", m.DEFAULT_LEXBOX_PASSWORD)
    )
    client = m.LexboxClient(
        args.lexbox_host,
        args.lexbox_user,
        password,
        auth_mode=args.lexbox_auth,
        timeout=args.lexbox_timeout,
    )
    client.login()
    # The client has no public method for this endpoint; _send is the same transport its own
    # calls use, and handles authentication and errors the same way.
    status, _headers, body = client._send(
        "GET", "/api/project/projectCodeAvailable/" + quote(lexbox_code, safe=""), authenticate=True
    )
    if status != 200:
        raise m.Fatal(f"asking LexBox whether {lexbox_code!r} exists failed: {client._describe(status, body)}")
    available = json.loads(body.decode("utf-8"))
    if not isinstance(available, bool):
        raise m.Fatal(f"projectCodeAvailable returned an unexpected body: {body[:200]!r}")
    return not available


def probe(config: m.Config, args, code: str, extras: set[str]) -> dict:
    new_code = code + args.suffix
    lexbox_code = m.send_receive_identifier(new_code)
    scheme, host = m.split_lexbox_host(args.lexbox_host)
    out: dict[str, object] = {
        "new_code": new_code,
        "lexbox_code": lexbox_code,
        # The same URL emit_custom_properties() tells a human to clone.
        "hg_url": f"{scheme}://{host}/hg/{lexbox_code}",
    }
    found = mongo_state(config, code, new_code)
    for side in ("source", "copy"):
        for key, value in found[side].items():
            out[f"{side}_{key}"] = value
    app = found["copy"]["app"] or found["source"]["app"] or "lexicon"
    out.update(send_receive_state(config, new_code))
    out.update(asset_state(config, app, new_code))
    out["migration_running"] = int(migration_running(code))
    if "custom-fields" in extras:
        out.update(custom_field_counts(config, code))
    if "lexbox" in extras:
        out["lexbox_exists"] = int(lexbox_has_project(args, lexbox_code))
    return out


def finish(config: m.Config, args, code: str) -> None:
    new_code = code + args.suffix
    copy = m.fetch_project(config, new_code)
    if copy is None:
        raise m.Fatal(f"there is no project {new_code!r} to finish")
    app = copy["appName"] or "lexicon"
    m.log("Moving assets into the Send/Receive work tree")
    m.link_assets_into_webwork(config, app, m.database_name(new_code), new_code)
    m.log("Send/Receive #2: pushing assets to LexBox")
    m.send_receive(config, new_code, timeout=args.sr_timeout, label="2/2")
    m.log("")
    m.log(f"Done. '{new_code}' has finished its asset steps.")


def main(argv: list[str]) -> int:
    command, code, extras, args = parse_cli(argv)
    config = m.Config()
    try:
        if command == "probe":
            for key, value in probe(config, args, code, extras).items():
                # One line per key: collapse any whitespace a value might carry.
                print(f"{key}={' '.join(str(value).split())}")
        else:
            finish(config, args, code)
    except m.Fatal as exc:
        m.log(f"ERROR: {exc}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
