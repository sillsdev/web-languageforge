#!/usr/bin/env python3
"""Migrate a non-Send/Receive Language Forge project into the Send/Receive system.

Given the projectCode of an existing project, this creates a complete copy whose
projectCode is the original with "-migrate" appended, points the copy's
sendReceiveProjectIdentifier at the LexBox-normalised form of that code, and
drives it through a full migration into LexBox.

The original project is never modified.

The source project must NOT already be a Send/Receive project: if it has a
non-empty sendReceiveProjectIdentifier the script exits with an error. Such a
project is already synced with a repository, and copying it would leave two LF
projects pointing into the same Send/Receive history.

MIGRATION SEQUENCE
    1. Copy the sf_<projectCode> database to sf_<projectCode>-migrate.
    2. Rewrite the copy's numeric option list keys as strings, and the two
       numeric lexicon references that point at them. See OPTION LIST KEY
       COERCION below. This touches the copy only.
    3. Give a fresh UUID4 to any lexicon entry in the copy whose guid is an
       empty string. See EMPTY ENTRY GUIDS below. This touches the copy only.
    4. Stage the on-disk assets as real directories under the copy's own assets
       folder. (They are converted to symlinks in step 8.)
    5. Insert the `projects` document: new _id, new projectCode, and
       sendReceiveProjectIdentifier set to the normalised form of that code
       (see send_receive_identifier -- underscores become hyphens and CamelCase
       is split, because LexBox project codes must be lowercase).
    6. init_lexbox_project() logs in to LexBox (POST /api/login), calls
       POST /api/project/initFwDataProject with the writing systems taken from
       the LF project config. A 200 from that endpoint is taken as confirmation
       that the project exists. Every writing system the project knows about
       must be covered by the vernacular or analysis list; any that is not is
       warned about and sent as analysis.
    7. Remove any webwork clone and LFMerge state file an earlier attempt left
       behind (see clear_send_receive_state -- the LexBox project just created
       has a new root changeset, so an older clone is unrelated to it), then run
       the first Send/Receive. LFMerge clones the repository into
       webwork/<projectcode>/ and pushes the Mongo data (lexicon, comments,
       option lists) up to LexBox. Then wait for it to finish.
    8. Move any asset not already present in
       webwork/<projectcode>/LinkedFiles/{AudioVisual,Pictures} into that tree,
       and replace the copy's assets/<appName>/sf_<code>/{audio,pictures}
       directories with symlinks pointing there -- the layout a real
       Send/Receive project has (LexProjectModel::createAssetsFolders).
    9. Second Send/Receive, to push those assets up to LexBox.

    Steps 7 and 9 wait on the LFMerge state file,
    sendreceive/state/<projectcode>.state, so the phases stay ordered.

WHERE TO RUN THIS
    Inside the `app` container, which is where the Mongo host, the project assets
    volume and the LFMerge sendreceive volume are all reachable:

        docker compose exec app python3 /var/www/scripts/copy_project_for_migration.py <projectCode>

    The base image (php:7.4-apache) ships no Python, so the development-base
    stage of docker/app/Dockerfile installs python3. If `python3: not found`,
    rebuild the image with `make build`.

    No pip packages are needed. This script deliberately uses only the standard
    library plus the mongosh/mongodump/mongorestore binaries that the app image
    already installs (see docker/base-php/Dockerfile).

    Note that the app and lfmerge containers share both the assets volume and the
    sendreceive volume (docker-compose.yml), so the files this script writes are
    the same files LFMerge reads.

WHAT GETS COPIED
    * the `projects` document in the main database
    * the project's own database, sf_<projectCode>, with all collections and
      indexes (lexicon, lexiconComments, optionlists, activity, messages)
    * the on-disk assets, assets/<appName>/sf_<projectCode>/{audio,pictures}
    * membership: the new project's _id is added to each member's
      users.projects array

OPTION LIST KEY COERCION
    Option list item keys are meant to be strings, but some projects store them
    as BSON int32: in the 2026-07-06 corpus, 39,759 such keys across 53 projects,
    nearly all in the `anthro-code` list (reached from config as
    senses.anthropologyCategories), the rest in `domain-type` and
    `pers-feature-value`. Step 2 rewrites every one of them in the copy as the
    string of that integer, which is exactly what each item's `abbreviation`
    already holds. Coercion cannot collide: no coerced key equals an existing
    string key in the same list, and no two integers coerce to the same string.

    The lexicon almost always already references these items by string ("27",
    "130"), so coercing the lists is what brings the two sides into agreement.
    Two senses in the whole corpus are the exception -- they reference by
    integer, and would be left dangling by a list-only coercion, so they are
    converted too. See SPECIAL_LEXICON_INT_REFERENCES; those two senses are the
    only lexicon documents this script modifies for the sake of option lists.
    The other lexicon change it makes is described next.

EMPTY ENTRY GUIDS
    Five projects in the 2026-07-06 corpus have exactly one lexicon entry whose
    guid is an empty string. That is the whole of the problem: no nulls, no
    missing guid fields, no malformed values, and entries only -- senses and
    examples never exhibit it. Step 3 therefore matches `guid: ""` exactly and
    leaves every other guid alone, including one that is a valid UUID of some
    version other than 4, which LfMerge parses happily.

    An empty guid does not make LfMerge fail, which is why it has gone
    unnoticed. LfMerge reads the field with Guid.TryParse
    (MongoConnection.CanParseGuid), so the entry is quietly dropped from the
    ObjectId->Guid map that comments are attached by, and
    ConvertMongoToLcmLexicon then falls back to `lfEntry.Guid ?? Guid.Empty`.
    The entry would be created in FieldWorks under the all-zeros GUID, and a
    second entry in the same state would find that object and overwrite it
    rather than create its own -- so entries would silently merge instead of
    erroring.

WHAT IS DELIBERATELY NOT TOUCHED
    * The SOURCE project, in every respect. All coercion happens in the copy,
      after the database has been duplicated.
    * Every other lexicon value. The only lexicon writes are the two senses
      named in SPECIAL_LEXICON_INT_REFERENCES and the empty entry guids of
      step 3; any other numeric option list reference is reported as a warning
      and left exactly as it is.
    * Guids on senses and examples. They are nullable in the same way, but the
      empty-string problem does not arise there, so they are not scanned.
    * `abbreviation` and `value` on option list items, which are already strings.
    * Sync state is copied verbatim: lastSyncedDate and the per-entry dirtySR
      flags are left exactly as the original has them. Because the source has
      never synced, that means lastSyncedDate is still its default of epoch 0 --
      which is what you want for a first push into an empty repository.
    * `sendReceiveProject` ({name, repository, role}) is not populated. The
      source has no Send/Receive configuration to copy, so the copy ends up with
      sendReceiveProjectIdentifier set but no repository details. LFMerge does
      not need them -- it works from the identifier -- but the LF UI displays
      them, so init_lexbox_project() is the place to record them if wanted.
    * `userrelation` unread-activity documents are not copied.
"""

from __future__ import annotations

import argparse
import http.cookiejar
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid
from typing import Any, Callable
from urllib.parse import quote_plus, urlencode, urlsplit, urlunsplit
from xml.sax.saxutils import escape as xml_escape

MIGRATE_SUFFIX = "-migrate"

# Defaults match the `app` service environment in docker-compose.yml, and the
# hardcoded LFMerge paths in SendReceiveCommands.php.
DEFAULT_MONGODB_CONN = "mongodb://lf-db:27017"
DEFAULT_DATABASE = "scriptureforge"
DEFAULT_ASSETS_ROOT = "/var/www/html/assets"
DEFAULT_SENDRECEIVE_BASE = "/var/lib/languageforge/lexicon/sendreceive"

# (assets subfolder, LinkedFiles subfolder) -- LexProjectModel::createAssetsFolders
ASSET_LINKED_FILES = (("audio", "AudioVisual"), ("pictures", "Pictures"))

# The only two lexicon values in the whole corpus that reference an option list
# item by a NUMBER rather than by a string. Everywhere else the lexicon already
# uses strings ("27", "130", "824.1"), so coercing the option lists on its own
# lines the two sides up -- but these two would be left pointing at a key that
# no longer exists, so they are coerced with them.
#
# Keyed by SOURCE projectCode (the copy's code is that plus --suffix, so the
# source is what identifies the data). The value is the field to look in and the
# exact `values` list that must be present, so a sense is only rewritten when
# both the project and the list match. Anything else numeric is reported and
# left alone. Found by scanning the 2026-07-06 mongodump:
#
#     test-project-d                  entry 58bfb4f78b2147101c74ece2  [18]
#     vocabularium_totius_latinitatis  entry 61de9ccb499649193b5d5ce5  [104]
#
# Both are anthropologyCategories, whose list is anthro-code. Both projects are
# tiny (65 and 3 entries), which is why nobody hit this before.
SPECIAL_LEXICON_INT_REFERENCES: dict[str, tuple[str, list[int]]] = {
    "test-project-d": ("anthropologyCategories", [18]),
    "vocabularium_totius_latinitatis": ("anthropologyCategories", [104]),
}

# SRState values, from src/angular-app/bellows/shared/model/send-receive-state.model.ts
SR_IN_PROGRESS = frozenset({"CLONING", "SYNCING", "PENDING", "LF_CLONING"})
SR_DONE = frozenset({"IDLE", "SYNCED"})
SR_FAILED = frozenset({"HOLD", "ERROR"})

WEB_USER = "www-data"

# LexBox. The JWT is delivered as this cookie, whose value literally IS the JWT
# (AuthKernel.cs:229 overrides the cookie ticket format to write a JWT).
# In development LexBox runs outside this Docker Compose environment, reached
# through the "admin.localhost:host-gateway" extra_hosts entry that the app and
# lfmerge services already declare, over plain HTTP. Production is lexbox.org.
DEFAULT_LEXBOX_HOST = "http://admin.localhost"
DEFAULT_LEXBOX_USER = "admin"
DEFAULT_LEXBOX_PASSWORD = "pass"
LEXBOX_AUTH_COOKIE = ".LexBoxAuth"
# Project.cs:12 -- LexBox rejects codes that do not match, and codes under 4 chars.
LEXBOX_CODE_RE = re.compile(r"^[a-z\d][a-z\-\d]*$")
LEXBOX_CODE_MIN_LENGTH = 4
# liblcm seeds a new project's anthropology list (the OCM outline) from a file shipped with
# SIL.LCModel and writes each label into the project's DEFAULT ANALYSIS writing system -- which is
# simply the first entry of wsAnalysis. The OCM file has no labels for an unlisted-language ("qaa")
# writing system, so one of those in first position makes CreateNewLangProj die inside
# InitializeAnthroList with
#     System.ArgumentOutOfRangeException ... (Parameter 'ws')
# and the project is never created. Every OCM entry does have an `en` label, so when the list leads
# with a qaa tag, `en` is moved (or added) to the front and the rest keeps its order behind it.
# Any other leading tag is left alone: reordering a working project's writing systems for no reason
# would change which one FieldWorks treats as its default analysis writing system.
ANTHRO_DEFAULT_ANALYSIS_WS = "en"
UNLISTED_LANGUAGE_PREFIX = "qaa"

# A writing system declared in both the vernacular and the analysis list gets taken out of one of
# them, so that each one has a single role in FieldWorks. Which one it leaves is decided by where
# its data actually is, not by which field the config happens to declare it in -- the config
# declaration can rest on a single stray value. One project declares "pt" on its lexeme field
# because one entry of 1248 has the vernacular headword duplicated into its "pt" alternative, while "pt"
# holds 1239 glosses, 1121 definitions and 1096 example translations. Going by the declaration would
# have made Portuguese vernacular-only and left the project with "en", which has three values in it.
#
# This writing system is never removed from the ANALYSIS list, whichever way its data leans. It is
# "en" for the same reason ANTHRO_DEFAULT_ANALYSIS_WS is: liblcm writes the anthropology list in the
# default analysis writing system and "en" is the only one the OCM file is guaranteed to have labels
# for, so a project left with no "en" in analysis can fail to be created at all. It can still be
# removed from the vernacular list, which is the usual outcome when a project glosses in English.
VERNACULAR_ANALYSIS_OVERLAP_EXEMPTION = "en"

# Custom fields. LF names them by the level they live at -- LfMerge's MagicStrings has
# customField_entry / customField_senses / customField_example -- and the config nests them under
# entry.fields, senses.fields and senses.fields.examples.fields to match.
CUSTOM_FIELD_PREFIX = "customField_"

# What a future LexBox API would need to create the field in FieldWorks. This is the inverse of
# LfMerge's CellarPropertyTypeToLfCustomFieldType (ConvertLcmToMongoCustomField.cs). That map is not
# injective -- MultiString and MultiUnicode both come out as multitext -- so the inverse picks
# MultiUnicode, which is what LF round-trips.
LCM_TYPE_FOR_LF_TYPE = {
    "multitext": "MultiUnicode",
    "optionlist": "ReferenceAtomic",
    "multioptionlist": "ReferenceCollection",
    "multiparagraph": "OwningAtomic",
}

# Shapes LF writes into the lexicon, used to guess the type of a field the config never declared.
# A guess is not a declaration, so anything derived this way is reported as one.
#     shape -> (LF type, LCM type)
LF_TYPE_FOR_VALUE_SHAPE = {
    "multitext": ("multitext", "MultiUnicode"),
    "single-listref": ("optionlist", "ReferenceAtomic"),
    "multi-listref": ("multioptionlist", "ReferenceCollection"),
    "paragraphs": ("multiparagraph", "OwningAtomic"),
    # LF has no Date or Number field type; it stores those as a multitext under a fake writing
    # system (LfMerge's MagicStrings.LanguageCodeForGenDateFields / ...ForIntFields). No project in
    # the migration backlog uses either, but the shape is recognised so one would not be mistaken
    # for text.
    "date": ("date (fake ws qaa-Qaad)", "GenDate"),
    "number": ("number (fake ws qaa-Zmth)", "Integer"),
}

# Option lists FieldWorks already has, from LfMerge's MagicStrings.LcmOptionlistNames. A custom
# field pointing at anything else needs its possibility list created before the field can be.
STANDARD_LF_OPTION_LIST_CODES = frozenset({
    "grammatical-info", "semantic-domain-ddp4", "domain-type", "environments", "location",
    "usage-type", "reversal-type", "sense-type", "anthro-code", "status", "etymology",
    "lexical-relation", "note-type", "paradigm", "users", "translation-type",
    "from-part-of-speech", "morph-type", "noun-slot", "verb-slot", "stative-slot",
    "noun-infl-class", "verb-infl-class",
})

# Custom field names that FieldWorks may or may not treat as the same field. FLEx is inconsistent
# about two names differing only by case -- sometimes one field, sometimes two -- so the migration
# gives one of them a distinct name before it ever reaches FieldWorks.
#
# One project has "Class Marker" and "Class marker" at the entry level, and they are NOT
# duplicates. 830 entries fill only the first, 1279 only the second, and the one entry that fills
# both holds the same value in each, so nothing is lost either way -- but they hold different
# conventions. "Class Marker" is the older field, populated in 2014, and every one of its 832
# values is a noun class morpheme ("mu", "ki") or the "##" placeholder, never a class number;
# "Class marker" is the 2016 field and mixes 1108 morphemes with 172 class numbers. Renaming rather
# than merging keeps the two apart so the distinction stays recoverable.
#
# Another project has "Morphophonemic Prop" and "MorphoPhonemic Prop" at the sense level, and here
# the two are not comparable at all. The lowercase-p one holds real data: 167 senses, all in "en",
# carrying a controlled vocabulary of vernacular morphophonemic properties ("underlong", "PMlowers",
# "RECIP; PMlowers; Mlowers; foreshortens") across 141 distinct values, nearly all written in 2014.
# The capital-P one has three senses, all in "es", holding ".", "x" and "do not load for CADA" --
# a scratch field somebody made by mistyping the capitalisation, used as a marker and abandoned.
# So it is renamed out of the way rather than merged, which would fold three junk values into a
# clean linguistic field. No sense fills both, and the two use different writing systems, so a
# merge would in fact have been lossless; it just would not have been sensible.
#
# Keyed by field NAME rather than by project, since the project will not necessarily carry the same
# code or name in production as it does in the test snapshot. Nothing here is level-specific: a
# name is renamed wherever it clashes, and "Class Marker" happens to be an entry field while
# "MorphoPhonemic Prop" is a sense field.
CASE_CLASH_CUSTOM_FIELD_RENAMES = {
    "Class Marker": "Class Marker Morpheme",
    "MorphoPhonemic Prop": "MorphoPhonemic Prop Unused",
}

# The LCM class each level's fields belong to, for the same future API.
LCM_CLASS_FOR_LEVEL = {"entry": "LexEntry", "senses": "LexSense", "examples": "LexExampleSentence"}

# --- FLExProject.CustomProperties ------------------------------------------ #
# FieldWorks keeps its custom field definitions in FLExProject.CustomProperties, the one file in
# revision 0 of a FLEx Mercurial repository. LfMerge will not create them itself -- it logs
# "Custom field X from LF skipped, because we're not yet creating new custom fields in LCM" -- so
# the definitions have to be in the repository BEFORE the first Send/Receive, which is the only
# pass that would have carried the data. That is why a project with custom fields stops short of
# Send/Receive and prints this file for a human to commit.
#
# The format is copied from real Chorus repositories, not invented: CRLF line endings, tab
# indentation, one attribute per line in alphabetical order, elements sorted by class then name,
# and no trailing newline after </AdditionalFields>.
CUSTOM_PROPERTIES_EOL = "\r\n"
CUSTOM_PROPERTIES_HEADER = '<?xml version="1.0" encoding="utf-8"?>'
CUSTOM_PROPERTIES_FILENAME = "FLExProject.CustomProperties"

# FieldWorks "magic" writing system selectors, all four of which occur here. The choice is only
# about which writing systems FLEx offers in the field; it does not change the field's type, which
# is always MultiUnicode because LF never had a single-string custom field.
#
# -1 and -2 name one writing system each, and are worth reaching for: a great many custom fields
# hold data in exactly one writing system, and a field showing one row rather than one row per
# writing system in a list is what that data actually is.
#
# The combined selectors matter because a field is not obliged to stay on one side of the project's
# vernacular/analysis divide. One project's "Top 10 list" holds Thai in 314 entries and English
# in 223; -4 alone would leave the English out of the field entirely.
WS_SELECTOR_FIRST_ANALYSIS = -1
WS_SELECTOR_FIRST_VERNACULAR = -2
WS_SELECTOR_ALL_ANALYSIS = -3
WS_SELECTOR_ALL_VERNACULAR = -4
WS_SELECTOR_ANALYSIS_THEN_VERNACULAR = -5
WS_SELECTOR_VERNACULAR_THEN_ANALYSIS = -6

# destclass for the types that need one: 7 is CmPossibility, what a list reference points at, and
# 14 is StText, what a multiparagraph owns.
LCM_DEST_CLASS_FOR_TYPE = {
    "ReferenceAtomic": 7,
    "ReferenceCollection": 7,
    "OwningAtomic": 14,
}

# listRoot GUIDs of the possibility lists in a project FwHeadless creates, read from the
# NewLangProj.fwdata template it builds every project from. These are NOT universal -- a project
# made by an older FieldWorks has different GUIDs for the same lists, which is why they come from
# the template and not from some existing project.
#
# Only lists that are BOTH in the template and mapped to an LF list code by LfMerge
# (ConvertLcmToMongoCustomField.GuidToListCode) are here. grammatical-info and
# semantic-domain-ddp4 are mapped by LfMerge but PartsOfSpeech and SemanticDomainList are absent
# from the template, so a fresh project has no GUID to point at; any other list arrives as its
# NAME rather than a code, and has to be created by hand first.
LCM_LIST_ROOT_GUIDS = {
    "anthro-code": "d87ba7c6-ea5e-11de-9dd2-0013722f8dec",
    "domain-type": "b0a1eb98-ea5e-11de-888e-0013722f8dec",
    "location": "d887937e-ea5e-11de-985e-0013722f8dec",
    "sense-type": "af32c340-ea5e-11de-9040-0013722f8dec",
    "status": "d86632ba-ea5e-11de-8a58-0013722f8dec",
    "usage-type": "af542404-ea5e-11de-8bde-0013722f8dec",
}
LIST_ROOT_PLACEHOLDER = "FILL-IN-LIST-ROOT-GUID"

# initFwDataProject builds a template .fwdata and pushes it; the LexBox test
# allows 5 minutes and disables retries because it is NOT idempotent.
DEFAULT_LEXBOX_TIMEOUT_SECONDS = 300

# How long to wait for lfmergeqm to dequeue our request before giving up, and
# how long a whole Send/Receive may take.
PICKUP_TIMEOUT_SECONDS = 90
DEFAULT_SR_TIMEOUT_SECONDS = 1800
POLL_INTERVAL_SECONDS = 2.0


# --------------------------------------------------------------------------- #
# configuration
# --------------------------------------------------------------------------- #


class Config:
    """Connection and path settings, read from the environment."""

    def __init__(self) -> None:
        self.conn = os.environ.get("MONGODB_CONN", DEFAULT_MONGODB_CONN)
        self.user = os.environ.get("MONGODB_USER", "")
        self.password = os.environ.get("MONGODB_PASS", "")
        self.authsource = os.environ.get("MONGODB_AUTHSOURCE", "admin")
        self.database = os.environ.get("DATABASE", DEFAULT_DATABASE)
        self.assets_root = os.environ.get("ASSETS_ROOT", DEFAULT_ASSETS_ROOT)
        self.sendreceive_base = os.environ.get("LFMERGE_BASE_DIR", DEFAULT_SENDRECEIVE_BASE)

    @property
    def syncqueue_path(self) -> str:
        return os.path.join(self.sendreceive_base, "syncqueue")

    def queue_file(self, project_code: str) -> str:
        # LfMerge's Queue.cs reads the FILENAME as the project code.
        return os.path.join(self.syncqueue_path, project_code)

    def state_file(self, project_code: str) -> str:
        # SendReceiveCommands.php:213 lowercases the code for the state file.
        return os.path.join(self.sendreceive_base, "state", project_code.lower() + ".state")

    def webwork_path(self, project_code: str) -> str:
        # LexProjectModel::getSendReceiveWorkFolder() lowercases the code.
        return os.path.join(self.sendreceive_base, "webwork", project_code.lower())

    def linked_files_path(self, project_code: str) -> str:
        return os.path.join(self.webwork_path(project_code), "LinkedFiles")

    def assets_path(self, app_name: str, db_name: str) -> str:
        return os.path.join(self.assets_root, app_name, db_name)

    def uri(self, database: str | None = None) -> str:
        """Build a mongodb:// URI with credentials embedded.

        The Mongo CLI tools refuse to combine --uri with --username/--db, so
        everything has to go into the URI itself.
        """
        parts = urlsplit(self.conn)
        netloc = parts.netloc
        if "@" in netloc:  # credentials already supplied in MONGODB_CONN
            host = netloc
        else:
            host = netloc
            if self.user:
                host = f"{quote_plus(self.user)}:{quote_plus(self.password)}@{netloc}"
        # The leading "/" is required before any query string, so always emit it.
        path = "/" + (database or "")
        query = parts.query
        if self.authsource and "authSource" not in query:
            query = f"{query}&authSource={self.authsource}" if query else f"authSource={self.authsource}"
        return urlunsplit((parts.scheme or "mongodb", host, path, query, ""))

    def safe_uri(self, database: str | None = None) -> str:
        """The URI with the password masked, for logging."""
        uri = self.uri(database)
        if self.password:
            uri = uri.replace(quote_plus(self.password), "****")
        return uri


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #


def log(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


class Fatal(Exception):
    """An error that should abort the run (and trigger rollback)."""


def database_name(project_code: str) -> str:
    """Replicate ProjectModel::databaseName() exactly (ProjectModel.php:115)."""
    return "sf_" + project_code.lower().replace(" ", "_")


def send_receive_identifier(project_code: str) -> str:
    """Derive a Send/Receive (LexBox) project code from a projectCode.

    Underscores become hyphens. An uppercase letter immediately following a
    lowercase letter becomes a hyphen plus its lowercase form, which splits
    CamelCase into words. Every other uppercase letter simply becomes lowercase,
    so a run of capitals is not broken up.

        TitleCaseProject -> title-case-project
        FOO_BAR          -> foo-bar

    LexBox project codes must match ^[a-z\\d][a-z-\\d]*$, so this makes the
    common Language Forge naming styles usable. It does not fix everything --
    spaces and other punctuation survive and are caught by validation.
    """
    result = []
    for index, character in enumerate(project_code):
        if character == "_":
            result.append("-")
        elif character.isupper():
            # "immediately follows a lowercase letter" is judged against the
            # original string, before underscores were rewritten.
            if index > 0 and project_code[index - 1].islower():
                result.append("-")
            result.append(character.lower())
        else:
            result.append(character)
    return "".join(result)


def require_tool(name: str) -> None:
    if shutil.which(name) is None:
        raise Fatal(
            f"Required tool '{name}' was not found on PATH. "
            "This script is meant to run inside the app container, which provides "
            "mongosh and mongodb-org-tools."
        )


def run(cmd: list[str], *, what: str) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Fatal(f"{what} failed (exit {result.returncode}):\n{result.stderr.strip()}")
    return result.stdout


def mongosh_json(config: Config, js: str, *, what: str) -> Any:
    """Run a mongosh script and parse the single JSON value it prints.

    The script is passed via a temp file so there is no shell quoting to get
    wrong, and values are interpolated with json.dumps.
    """
    require_tool("mongosh")
    with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False) as handle:
        handle.write(js)
        script_path = handle.name
    try:
        output = run(["mongosh", config.uri(), "--quiet", "--file", script_path], what=what)
    finally:
        os.unlink(script_path)

    for line in reversed(output.splitlines()):
        line = line.strip()
        if line:
            try:
                return json.loads(line)
            except json.JSONDecodeError as exc:
                raise Fatal(f"{what}: could not parse mongosh output {line!r}: {exc}") from exc
    raise Fatal(f"{what}: mongosh produced no output")


def chown_to_web_user(path: str, *, recursive: bool = True) -> None:
    """Best-effort chown to www-data, so LFMerge and Apache can use the files.

    LFMerge runs lfmergeqm as www-data, so anything this script drops into the
    sendreceive tree has to be readable and writable by that user.
    """
    try:
        import grp
        import pwd

        uid = pwd.getpwnam(WEB_USER).pw_uid
        gid = grp.getgrnam(WEB_USER).gr_gid
    except (ImportError, KeyError):
        return

    def attempt(target: str) -> None:
        try:
            os.chown(target, uid, gid, follow_symlinks=False)
        except (PermissionError, FileNotFoundError, NotImplementedError, TypeError):
            try:
                os.chown(target, uid, gid)
            except (PermissionError, FileNotFoundError):
                pass

    attempt(path)
    if recursive and os.path.isdir(path) and not os.path.islink(path):
        for root, dirnames, filenames in os.walk(path):
            for name in dirnames + filenames:
                attempt(os.path.join(root, name))


# --------------------------------------------------------------------------- #
# mongo steps
# --------------------------------------------------------------------------- #


def fetch_project(config: Config, project_code: str) -> dict | None:
    js = f"""
const main = db.getSiblingDB({json.dumps(config.database)});
const doc = main.projects.findOne({{ projectCode: {json.dumps(project_code)} }});
print(EJSON.stringify(doc === null ? {{ found: false }} : {{
  found: true,
  id: doc._id.toString(),
  projectCode: doc.projectCode,
  projectName: doc.projectName || "",
  appName: doc.appName || "",
  siteName: doc.siteName || "",
  isArchived: doc.isArchived === true,
  sendReceiveProjectIdentifier: doc.sendReceiveProjectIdentifier || "",
  memberCount: Object.keys(doc.users || {{}}).length,
}}));
"""
    result = mongosh_json(config, js, what="Reading project record")
    return result if result.get("found") else None


def dedup(tags: list[str]) -> list[str]:
    """Drop duplicates and blanks, preserving first-seen order."""
    seen: set[str] = set()
    result = []
    for tag in tags:
        tag = (tag or "").strip()
        if tag and tag not in seen:
            seen.add(tag)
            result.append(tag)
    return result


def fetch_writing_systems(config: Config, project_code: str) -> dict[str, list[str]]:
    """Read the ordered vernacular and analysis writing system tags from the config.

    Language Forge has no vernacular/analysis flag anywhere -- the distinction is
    conventional, encoded in which config field a tag appears under:

        vernacular: config.entry.fields.lexeme.inputSystems      (index 0 is the
                    project's primary language, per LexProjectModel.php:38)
                    plus config.entry.fields.citationForm.inputSystems
        analysis:   config.entry.fields.senses.fields.definition.inputSystems
                    plus ...senses.fields.gloss.inputSystems

    The lists are ordered BSON arrays of hyphenated BCP-47 tags and are passed
    through verbatim. The secondary fields are unioned in because a project may
    populate gloss but not definition (or citationForm but not lexeme), and a
    writing system missing from the FieldWorks project could not receive data.
    Order is preserved, primary field first.

    Also returns the complete set of writing systems the project knows about, so
    the caller can check that vernacular + analysis covers all of them:

        config_all: every inputSystems entry anywhere under config.entry, found
                    by walking the whole field tree (fields can nest, e.g.
                    senses.examples.sentence). Ordered by fieldOrder where the
                    config provides one, so the order is the config's own.
        declared:   the keys of project.inputSystems, which is the project's map
                    of writing system definitions (InputSystem.php). This is a
                    BSON document, so its order is insertion order and is not
                    meaningful -- it is only used to catch writing systems that
                    no config field references.
    """
    js = f"""
const main = db.getSiblingDB({json.dumps(config.database)});
const doc = main.projects.findOne(
  {{ projectCode: {json.dumps(project_code)} }},
  {{ config: 1, inputSystems: 1 }}
);
const entry = (((doc || {{}}).config || {{}}).entry) || {{}};
const fields = entry.fields || {{}};
const senses = ((fields.senses || {{}}).fields) || {{}};

function tags(field) {{
  return (field && Array.isArray(field.inputSystems)) ? field.inputSystems : [];
}}

// Walk the entire config field tree, collecting every inputSystems entry.
// fieldOrder is the order the user sees, so honour it and append any field not
// listed there; nested field lists (senses, examples) are recursed into.
const configAll = [];
function walk(fieldList) {{
  if (!fieldList || typeof fieldList !== "object") return;
  const children = fieldList.fields || {{}};
  const order = Array.isArray(fieldList.fieldOrder) ? fieldList.fieldOrder : [];
  const names = [];
  order.forEach(function (name) {{
    if (children[name] && names.indexOf(name) === -1) names.push(name);
  }});
  Object.keys(children).forEach(function (name) {{
    if (names.indexOf(name) === -1) names.push(name);
  }});
  names.forEach(function (name) {{
    const child = children[name];
    tags(child).forEach(function (tag) {{ configAll.push(tag); }});
    if (child && child.fields) walk(child);
  }});
}}
walk(entry);

print(EJSON.stringify({{
  lexeme: tags(fields.lexeme),
  citationForm: tags(fields.citationForm),
  definition: tags(senses.definition),
  gloss: tags(senses.gloss),
  configAll: configAll,
  declared: Object.keys((doc || {{}}).inputSystems || {{}}),
}}));
"""
    found = mongosh_json(config, js, what="Reading writing systems from project config")
    return {
        "lexeme": list(found["lexeme"]),
        "citationForm": list(found["citationForm"]),
        "definition": list(found["definition"]),
        "gloss": list(found["gloss"]),
        "config_all": list(found["configAll"]),
        "declared": list(found["declared"]),
    }


def fetch_custom_fields(config: Config, project_code: str) -> dict[str, dict]:
    """The custom fields the project config declares, keyed by LF field name.

    Each value carries the level the field lives at, the LF `type` discriminator, the label, the
    writing systems the field uses and, for list-backed fields, the option list code.

    The config is authoritative for a field's TYPE, but not for whether it is used: 8 fields in the
    2026-07-06 corpus are declared and never populated, and 32 are populated without being declared.
    scan_custom_field_usage() supplies the other half.
    """
    js = f"""
const mainDb = {json.dumps(config.database)};
const projectCode = {json.dumps(project_code)};
const prefix = {json.dumps(CUSTOM_FIELD_PREFIX)};
""" + """
const main = db.getSiblingDB(mainDb);
const doc = main.projects.findOne({ projectCode: projectCode }, { config: 1 });
const entry = (((doc || {}).config || {}).entry) || {};

const found = {};

// The three levels are spelled out rather than walked generically, so that the level recorded for
// each field is exactly the one its name is prefixed with.
function collect(fieldList, level) {
  const fields = (fieldList || {}).fields || {};
  Object.keys(fields).forEach(function (name) {
    if (name.indexOf(prefix) !== 0) return;
    const field = fields[name] || {};
    found[name] = {
      level: level,
      type: field.type || null,
      label: field.label || null,
      inputSystems: Array.isArray(field.inputSystems) ? field.inputSystems : [],
      listCode: field.listCode || null
    };
  });
  return fields;
}

const entryFields = collect(entry, "entry");
const senseFields = collect(entryFields.senses, "senses");
collect(senseFields.examples, "examples");

print(EJSON.stringify(found));
"""
    return mongosh_json(config, js, what=f"Reading custom field config for {project_code}")


def scan_custom_field_usage(config: Config, db_name: str) -> dict[str, dict]:
    """How each custom field is actually used in db_name.lexicon, keyed by LF field name.

    Reports, per field: the level it was seen at, how many entries carry a value, how many values
    in total, the value shapes observed (so a field the config does not declare can still be typed),
    the writing systems its values use, and how many entries carry data in each of them.

    The per-writing-system counts are what a human uses to check a guess: a field whose data is
    almost all in the vernacular writing system is a vernacular field whatever the config says.

    Shape detection mirrors what LF writes: a multitext is {ws: {value: ...}}, a single option list
    reference is {value: ...}, a multiple one is {values: [...]}.
    """
    js = f"""
const targetName = {json.dumps(db_name)};
""" + """
const target = db.getSiblingDB(targetName);
const found = {};

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

function shapeOf(value) {
  if (value === null || typeof value !== "object") return "scalar";
  if (Array.isArray(value)) return "array";
  // Order matters: a multitext has no "value"/"values" key of its own, only writing systems.
  if (Object.prototype.hasOwnProperty.call(value, "values")) return "multi-listref";
  if (Object.prototype.hasOwnProperty.call(value, "value")) return "single-listref";
  if (Object.prototype.hasOwnProperty.call(value, "paragraphs")) return "paragraphs";
  const keys = Object.keys(value);
  if (keys.indexOf("qaa-Qaad") !== -1) return "date";
  if (keys.indexOf("qaa-Zmth") !== -1) return "number";
  const allMultitext = keys.length > 0 && keys.every(function (k) {
    const inner = value[k];
    return inner && typeof inner === "object" && Object.prototype.hasOwnProperty.call(inner, "value");
  });
  return allMultitext ? "multitext" : "unrecognised";
}

function record(level, holder, seenThisEntry) {
  const fields = (holder || {}).customFields || {};
  Object.keys(fields).forEach(function (name) {
    const value = fields[name];
    if (isEmpty(value)) return;
    if (!found[name]) {
      found[name] = { level: level, entries: 0, values: 0, shapes: [], writingSystems: [], wsEntries: {} };
    }
    const record_ = found[name];
    record_.values += 1;
    const shape = shapeOf(value);
    if (record_.shapes.indexOf(shape) === -1) record_.shapes.push(shape);
    if (!seenThisEntry[name]) seenThisEntry[name] = {};
    if (shape === "multitext" || shape === "date" || shape === "number") {
      Object.keys(value).forEach(function (ws) {
        // An empty alternative is not use of that writing system, matching isEmpty() above.
        if (isEmpty(value[ws])) return;
        if (record_.writingSystems.indexOf(ws) === -1) record_.writingSystems.push(ws);
        seenThisEntry[name][ws] = true;
      });
    }
  });
}

if (target.getCollectionNames().indexOf("lexicon") !== -1) {
  target.lexicon.find({}, { customFields: 1, senses: 1 }).forEach(function (doc) {
    const seenThisEntry = {};
    record("entry", doc, seenThisEntry);
    (doc.senses || []).forEach(function (sense) {
      if (!sense || typeof sense !== "object") return;
      record("senses", sense, seenThisEntry);
      (sense.examples || []).forEach(function (example) {
        if (example && typeof example === "object") record("examples", example, seenThisEntry);
      });
    });
    // entries counts entries, not values: a field used twice in one entry still counts once, and
    // the same goes for each of its writing systems.
    Object.keys(seenThisEntry).forEach(function (name) {
      found[name].entries += 1;
      Object.keys(seenThisEntry[name]).forEach(function (ws) {
        found[name].wsEntries[ws] = (found[name].wsEntries[ws] || 0) + 1;
      });
    });
  });
}

print(EJSON.stringify(found));
"""
    return mongosh_json(config, js, what=f"Scanning custom field usage in {db_name}")


def strip_custom_field_prefix(name: str, level: str) -> str:
    """The bare field name, with LF's "customField_<level>_" prefix removed.

    LfMerge builds these names in ConvertUtilities.NormalizedFieldName as
    customField_<entry|senses|examples>_<LCM field name, spaces as underscores>, so the level has to
    come off as well as the "customField_" part. Whatever is left is the LCM field name with its
    spaces still encoded; report_custom_fields() puts those back.
    """
    for candidate in (f"{CUSTOM_FIELD_PREFIX}{level}_", CUSTOM_FIELD_PREFIX):
        if name.startswith(candidate):
            return name[len(candidate):]
    return name


def describe_custom_fields(declared: dict[str, dict], used: dict[str, dict]) -> list[dict]:
    """Merge the config and the data into one row per custom field, sorted for reporting.

    A field declared in the config takes its type from there. A field only found in the data has its
    type guessed from the value shape, and is marked as a guess -- a guess is a reasonable basis for
    a report and a poor basis for creating a field in FieldWorks, where the type is hard to undo.
    """
    rows = []
    for name in sorted(set(declared) | set(used)):
        config_entry = declared.get(name, {})
        usage = used.get(name, {})
        level = config_entry.get("level") or usage.get("level") or "?"
        shapes = list(usage.get("shapes") or [])

        lf_type = config_entry.get("type")
        guessed = False
        if lf_type:
            lcm_type = LCM_TYPE_FOR_LF_TYPE.get(lf_type)
        elif len(shapes) == 1:
            lf_type, lcm_type = LF_TYPE_FOR_VALUE_SHAPE.get(shapes[0], (None, None))
            guessed = True
        else:
            lf_type, lcm_type = None, None
            guessed = bool(shapes)

        rows.append({
            "name": name,
            "short_name": strip_custom_field_prefix(name, level),
            "level": level,
            "lf_type": lf_type,
            "lcm_type": lcm_type,
            "lcm_class": LCM_CLASS_FOR_LEVEL.get(level),
            "guessed": guessed,
            "declared": name in declared,
            "label": config_entry.get("label"),
            "list_code": config_entry.get("listCode"),
            "input_systems": config_entry.get("inputSystems") or usage.get("writingSystems") or [],
            "ws_entries": usage.get("wsEntries") or {},
            "entries": usage.get("entries", 0),
            "values": usage.get("values", 0),
            "shapes": shapes,
        })
    order = {"entry": 0, "senses": 1, "examples": 2}
    rows.sort(key=lambda row: (order.get(row["level"], 9), -row["entries"], row["name"]))
    return rows


def report_custom_fields(rows: list[dict]) -> None:
    """Print the custom fields, and what a future LexBox API would need in order to create them."""
    if not rows:
        log("Custom fields: none")
        return

    log(f"Custom fields ({len(rows)}):")
    for row in rows:
        detail = f"list={row['list_code']}" if row["list_code"] else ",".join(row["input_systems"])
        flags = []
        if row["guessed"]:
            flags.append("GUESSED from data, not in config")
        elif not row["declared"]:
            flags.append("not in config")
        if row["entries"] == 0:
            flags.append("declared but unused")
        if row["list_code"] and row["list_code"] not in STANDARD_LF_OPTION_LIST_CODES:
            flags.append(f"option list '{row['list_code']}' is not one FieldWorks ships")
        if row["lf_type"] is None:
            flags.append(f"type undetermined (shapes seen: {', '.join(row['shapes']) or 'none'})")
        log(f"  {row['level']:8s} {row['short_name']:34s} {str(row['lf_type']):24s} "
            f"{detail:18s} {row['entries']:6d} entries"
            + ("   [" + "; ".join(flags) + "]" if flags else ""))

    guessed = [row for row in rows if row["guessed"]]
    lists_needed = sorted({row["list_code"] for row in rows
                           if row["list_code"] and row["list_code"] not in STANDARD_LF_OPTION_LIST_CODES})
    log("")
    log("  To create these in LexBox, an API would need per field: LCM class, field name, type,")
    log("  writing systems, and for list fields the possibility list. As derived here:")
    for row in rows:
        if row["lcm_type"] is None:
            continue
        field_name = row["short_name"].replace("_", " ")
        log(f"    {row['lcm_class'] or '?':19s} {field_name:34s} {row['lcm_type']:19s}"
            + (f" list={row['list_code']}" if row["list_code"] else "")
            + ("   (type guessed)" if row["guessed"] else ""))
    if guessed:
        log("")
        log(f"  WARNING: {len(guessed)} field(s) above are typed by GUESS from the value shape, because")
        log("           the project config does not declare them. Confirm each before anything creates")
        log("           it in FieldWorks: a wrong custom field type is painful to undo once synced.")
    if lists_needed:
        log("")
        log(f"  WARNING: {len(lists_needed)} option list(s) are not ones FieldWorks ships and would have to be")
        log(f"           created first: {', '.join(lists_needed)}")


def plan_custom_field_renames(rows: list[dict]) -> tuple[list[dict], list[str]]:
    """Work out which custom fields have to be renamed, and which case clashes are unhandled.

    Returns (renames, problems). Each rename carries the level, the Mongo key to rename and the key
    to rename it to, plus the FieldWorks names either side for reporting.

    Two custom fields whose names differ only by case are a hazard, because FLEx is inconsistent
    about whether it treats them as one field or two. Only the clashes named in
    CASE_CLASH_CUSTOM_FIELD_RENAMES are handled; anything else is reported for a human rather than
    guessed at, since which of the two should keep its name -- and whether they even hold the same
    kind of data -- is not derivable from the names.

    Names are compared within a level. A field on LexEntry and one on LexSense do not collide even
    when identically named, because FieldWorks keys a custom field by its class as well as its name.
    """
    groups: dict[tuple[str, str], list[dict]] = {}
    for row in rows:
        groups.setdefault((row["level"], row["short_name"].lower()), []).append(row)
    taken = set(groups)

    renames: list[dict] = []
    problems: list[str] = []
    for (level, _lowered), group in sorted(groups.items()):
        spellings = {row["short_name"] for row in group}
        if len(spellings) < 2:
            continue

        renamed: list[dict] = []
        for row in sorted(group, key=lambda item: item["short_name"]):
            new_name = CASE_CLASH_CUSTOM_FIELD_RENAMES.get(row["short_name"].replace("_", " "))
            if new_name is None:
                continue
            new_short = new_name.replace(" ", "_")
            if (level, new_short.lower()) in taken:
                problems.append(
                    f"{level}: cannot rename {row['short_name'].replace('_', ' ')!r} to "
                    f"{new_name!r} because the project already has a field of that name"
                )
                continue
            # Take the prefix off the row's own key rather than rebuilding it, so whatever spelling
            # of customField_<level>_ this project uses is preserved exactly.
            prefix = row["name"][: len(row["name"]) - len(row["short_name"])]
            renames.append({
                "level": level,
                "old_key": row["name"],
                "new_key": prefix + new_short,
                "old_name": row["short_name"].replace("_", " "),
                "new_name": new_name,
            })
            taken.add((level, new_short.lower()))
            renamed.append(row)

        left = sorted(spellings - {row["short_name"] for row in renamed})
        if len(left) > 1:
            problems.append(
                f"{level}: these custom field names differ only by case and none of them is one "
                f"this script knows how to rename: "
                + ", ".join(repr(name.replace("_", " ")) for name in left)
            )
    return renames, problems


def apply_custom_field_renames(rows: list[dict], renames: list[dict]) -> None:
    """Rewrite the described rows in place so everything downstream sees the new names.

    The FieldWorks definitions -- and so FLExProject.CustomProperties -- are built from these rows.
    A definition under the old name would not match the data the migration is about to write, and
    LfMerge would skip the field.
    """
    by_key = {(rename["level"], rename["old_key"]): rename for rename in renames}
    for row in rows:
        rename = by_key.get((row["level"], row["name"]))
        if rename is not None:
            row["name"] = rename["new_key"]
            row["short_name"] = rename["new_name"].replace(" ", "_")


def report_custom_field_renames(renames: list[dict], problems: list[str]) -> None:
    """Say what will be renamed, and what cannot be."""
    for rename in renames:
        log(f"  {rename['level']:8s} {rename['old_name']!r} -> {rename['new_name']!r}"
            f"  ({rename['old_key']} -> {rename['new_key']})")
    for problem in problems:
        log(f"  ERROR: {problem}")


def rename_custom_fields_in_lexicon(
    config: Config, db_name: str, renames: list[dict]
) -> dict:
    """Rename custom field keys throughout db_name.lexicon, in the COPY only.

    Renames customFields and customFieldGuids alike, at whichever level the field lives at. The
    whole document is rewritten rather than updated with $rename, which cannot reach a key inside
    an array element; nothing else about it is touched, so dateModified and the dirtySR flags keep
    saying when the entry was last really worked on.

    A container that somehow already holds the new key is reported and left alone rather than
    overwritten, which would lose whichever value was there.
    """
    if not renames:
        return {"entriesChanged": 0, "keysRenamed": 0, "conflicts": []}

    js = f"""
const target = db.getSiblingDB({json.dumps(db_name)});
const renames = {json.dumps(renames)};
""" + """
// The containers a rename applies to, by the level the field was declared at.
function containersFor(doc, level) {
  if (level === "entry") return [doc];
  const senses = (doc.senses || []).filter(function (s) { return s && typeof s === "object"; });
  if (level === "senses") return senses;
  const examples = [];
  senses.forEach(function (sense) {
    (sense.examples || []).forEach(function (example) {
      if (example && typeof example === "object") examples.push(example);
    });
  });
  return examples;
}

let entriesChanged = 0;
let keysRenamed = 0;
const conflicts = [];

target.lexicon.find({}).forEach(function (doc) {
  let dirty = false;
  renames.forEach(function (rename) {
    containersFor(doc, rename.level).forEach(function (container) {
      ["customFields", "customFieldGuids"].forEach(function (holder) {
        const fields = container[holder];
        if (!fields || typeof fields !== "object") return;
        if (!Object.prototype.hasOwnProperty.call(fields, rename.old_key)) return;
        if (Object.prototype.hasOwnProperty.call(fields, rename.new_key)) {
          conflicts.push({ id: doc._id.toString(), holder: holder, key: rename.new_key });
          return;
        }
        fields[rename.new_key] = fields[rename.old_key];
        delete fields[rename.old_key];
        keysRenamed += 1;
        dirty = true;
      });
    });
  });
  if (dirty) {
    target.lexicon.replaceOne({ _id: doc._id }, doc);
    entriesChanged += 1;
  }
});

print(EJSON.stringify({
  entriesChanged: entriesChanged,
  keysRenamed: keysRenamed,
  conflicts: conflicts
}));
"""
    result = mongosh_json(config, js, what=f"Renaming custom fields in {db_name}")
    if result["conflicts"]:
        raise Fatal(
            f"{len(result['conflicts'])} container(s) already held the renamed custom field key, "
            "so the rename was abandoned there rather than overwrite a value: "
            + ", ".join(f"{c['id']}.{c['holder']}.{c['key']}" for c in result["conflicts"][:5])
        )
    log(f"  {result['keysRenamed']} custom field key(s) renamed in "
        f"{result['entriesChanged']} entry/entries")
    return result


def derive_ws_selector(
    field_ws: list[str], vernacular: list[str], analysis: list[str], ws_entries: dict[str, int]
) -> tuple[int, bool, str]:
    """Pick FieldWorks' magic writing system selector for a text custom field.

    A field holding data in exactly one writing system gets the selector naming just that one, when
    it leads a list: -2 for the first vernacular writing system, -1 for the first analysis one. Most
    text custom fields in these projects are like this, and the single-writing-system selectors are
    what makes them look right in FLEx rather than showing an empty row per writing system in a
    list. A writing system leading both lists takes -2, since either selector resolves to it.

    Otherwise -4 covers every vernacular writing system of the project and -3 every analysis one, so
    a field whose writing systems sit entirely inside one of the two lists gets that list's selector.

    A field that spans both gets a combined selector instead: -6 for every vernacular writing
    system followed by every analysis one, -5 for the other order. Both cover the same set, so the
    choice is only about which the user sees first, and that is settled by where the data actually
    is -- the writing systems holding the most entries lead. FieldWorks still has no selector
    meaning "these particular writing systems", so a combined selector brings in the project's
    other writing systems too; that is harmless next to dropping the ones a single-sided selector
    would leave out.

    The selector is not recoverable from LF: LfMerge expanded it into a plain list of writing
    systems on the way in (ConvertLcmToMongoCustomField), so all that survives is where those
    writing systems ended up. Returns (selector, confident, why not).
    """
    vern, anal = set(vernacular), set(analysis)
    tags = set(field_ws)

    # Checked before anything else, and against the DATA rather than the declaration: a field with
    # one writing system's worth of data can be named exactly, and that beats any list selector.
    with_data = [tag for tag, count in ws_entries.items() if count > 0]
    if len(with_data) == 1:
        only = with_data[0]
        selector = None
        if vernacular and only == vernacular[0]:
            selector = WS_SELECTOR_FIRST_VERNACULAR
        elif analysis and only == analysis[0]:
            selector = WS_SELECTOR_FIRST_ANALYSIS
        if selector is not None:
            # Narrowing is possible: a field declaring several writing systems but holding data in
            # one keeps only that one in FLEx. No data is lost, but say so, since it is a decision.
            wider = sorted(tags - {only})
            if wider:
                return (selector, False,
                        f"all its data is in '{only}', so {selector} names just that one; the "
                        f"config also lists {', '.join(wider)}, which the field will no longer offer")
            return selector, True, ""

    if not tags:
        return WS_SELECTOR_ALL_VERNACULAR, False, "the field declares no writing systems at all"
    within_vernacular, within_analysis = tags <= vern, tags <= anal
    if within_vernacular and not within_analysis:
        return WS_SELECTOR_ALL_VERNACULAR, True, ""
    if within_analysis and not within_vernacular:
        return WS_SELECTOR_ALL_ANALYSIS, True, ""
    if within_vernacular and within_analysis:
        # Covered either way, so the selector is not in doubt; which side the field belongs to is,
        # and nothing in the config can settle it.
        return (WS_SELECTOR_ALL_VERNACULAR, False,
                "every writing system it uses is both vernacular and analysis in this project")

    # Neither single-sided selector covers all of it. A combined one reaches both lists, so the
    # only remaining question is which side leads: the one holding more of this field's data. A
    # writing system on both sides counts for both and so cannot break the tie.
    # Even a combined selector only reaches writing systems the project knows about, though.
    uncovered = tags - vern - anal
    if not (tags & vern) and not (tags & anal):
        # Every writing system it uses is outside both lists, so no selector reaches any of them.
        # The selector is not the thing to fix here; the project's writing systems are.
        return (WS_SELECTOR_VERNACULAR_THEN_ANALYSIS, False,
                f"none of its writing systems ({', '.join(sorted(tags))}) are in the project's "
                f"vernacular or analysis lists, so no selector reaches them")

    vernacular_entries = sum(ws_entries.get(tag, 0) for tag in tags & vern)
    analysis_entries = sum(ws_entries.get(tag, 0) for tag in tags & anal)
    if analysis_entries > vernacular_entries:
        selector, leading = WS_SELECTOR_ANALYSIS_THEN_VERNACULAR, "analysis"
    else:
        selector, leading = WS_SELECTOR_VERNACULAR_THEN_ANALYSIS, "vernacular"

    why = f"neither -3 nor -4 covers all of its writing systems, so {selector} takes in both lists"
    if analysis_entries == vernacular_entries:
        why += (f" and leads with the {leading} ones, the two sides holding the same amount of its "
                f"data ({vernacular_entries} entries each)")
    else:
        why += (f" and leads with the {leading} ones, which hold more of its data "
                f"({max(vernacular_entries, analysis_entries)} entries vs "
                f"{min(vernacular_entries, analysis_entries)})")
    if uncovered:
        plural = len(uncovered) > 1
        why += (f"; {', '.join(sorted(uncovered))} "
                f"{'are' if plural else 'is'} in neither list and "
                f"{'stay' if plural else 'stays'} uncovered")
    return selector, False, why


def plan_custom_field_definitions(
    rows: list[dict], vernacular: list[str], analysis: list[str]
) -> tuple[list[dict], list[tuple[dict, str]]]:
    """Turn described custom fields into FieldWorks definitions, and say what was left out.

    Returns (definitions, dropped). A definition carries the attributes FieldWorks writes and the
    comment lines that belong above it; `dropped` pairs each omitted field with the reason, so the
    caller can report rather than silently lose it.
    """
    definitions: list[dict] = []
    dropped: list[tuple[dict, str]] = []

    for row in rows:
        lcm_type, lcm_class = row["lcm_type"], row["lcm_class"]
        if lcm_type is None:
            dropped.append((row, f"type undetermined (shapes seen: {', '.join(row['shapes']) or 'none'})"))
            continue
        if lcm_class is None:
            dropped.append((row, f"unrecognised level {row['level']!r}"))
            continue

        # LF never offered the single-string custom field type, so every text field it holds is a
        # MultiUnicode that happens to have one writing system -- never a FieldWorks String.
        is_text = lcm_type == "MultiUnicode"
        if not is_text and row["entries"] == 0:
            # A list or paragraph field with no data buys nothing and costs a possibility list that
            # a new project may not even have. There is no data to lose by leaving it out.
            dropped.append((row, "no data, and not a text field"))
            continue

        name = row["short_name"].replace("_", " ")
        attributes: dict[str, str] = {
            "class": lcm_class,
            "key": f"{lcm_class}{name}",
            "name": name,
            "type": lcm_type,
        }
        dest_class = LCM_DEST_CLASS_FOR_TYPE.get(lcm_type)
        if dest_class is not None:
            attributes["destclass"] = str(dest_class)
        # LF's label is the only human-readable description that survives the round trip; FieldWorks
        # keeps its own helpString, which LfMerge never carried across. Only worth writing when it
        # says something the field name does not.
        label = (row["label"] or "").strip()
        if label and label != name:
            attributes["helpString"] = label

        notes: list[str] = []
        needs_review = False

        if row["list_code"]:
            list_root = LCM_LIST_ROOT_GUIDS.get(row["list_code"])
            if list_root is None:
                list_root = LIST_ROOT_PLACEHOLDER
                needs_review = True
                notes.append(
                    f"REVIEW: option list {row['list_code']!r} has no known GUID in a newly created "
                    f"FieldWorks project. Create the list, then replace listRoot below with its GUID."
                )
            attributes["listRoot"] = list_root

        if is_text:
            selector, confident, why = derive_ws_selector(
                row["input_systems"], vernacular, analysis, row["ws_entries"])
            attributes["wsSelector"] = str(selector)
            if not confident:
                needs_review = True
                notes.append(f"REVIEW: wsSelector guessed as {selector}, because {why}.")

        if row["guessed"]:
            needs_review = True
            notes.append(
                f"REVIEW: type GUESSED as {lcm_type} from the data (shapes seen: "
                f"{', '.join(row['shapes']) or 'none'}); the LF config does not declare this field."
            )

        if needs_review:
            notes.append(_ws_usage_note(row))

        definitions.append({"row": row, "attributes": attributes, "notes": notes,
                            "needs_review": needs_review})

    return definitions, dropped


def _ws_usage_note(row: dict) -> str:
    """How many entries hold data in each writing system -- the evidence for checking a guess."""
    counts = row["ws_entries"]
    if not counts:
        return f"{row['entries']} entry/entries carry data, none of it in a named writing system"
    detail = ", ".join(
        f"{ws}={counts[ws]}" for ws in sorted(counts, key=lambda tag: (-counts[tag], tag))
    )
    return f"entries with data per writing system: {detail}"


def xml_comment_text(text: str) -> str:
    """Make text safe inside an XML comment, which may not contain "--" nor end with "-"."""
    text = " ".join(text.split())
    while "--" in text:
        text = text.replace("--", "- -")
    return f"{text} " if text.endswith("-") else text


def build_custom_properties_xml(definitions: list[dict]) -> str:
    """Render FLExProject.CustomProperties exactly as FieldWorks writes it.

    Elements sorted by class then name, attributes alphabetical and one per line, tab indented,
    CRLF throughout and no trailing newline -- all copied from real Chorus repositories so that the
    first commit a human makes looks like one FieldWorks would have made.
    """
    lines = [CUSTOM_PROPERTIES_HEADER, "<AdditionalFields>"]
    for definition in sorted(
        definitions, key=lambda item: (item["attributes"]["class"], item["attributes"]["name"])
    ):
        for note in definition["notes"]:
            lines.append(f"\t<!-- {xml_comment_text(note)} -->")
        lines.append("\t<CustomField")
        attributes = sorted(definition["attributes"].items())
        for index, (attribute, value) in enumerate(attributes):
            closing = " />" if index == len(attributes) - 1 else ""
            escaped = xml_escape(str(value), {'"': "&quot;"})
            lines.append(f'\t\t{attribute}="{escaped}"{closing}')
    lines.append("</AdditionalFields>")
    return CUSTOM_PROPERTIES_EOL.join(lines)


def write_custom_properties(xml: str, path: str) -> str:
    """Write the XML to path, or path.1 / path.2 / ... Never overwrites an existing file.

    O_EXCL rather than an exists() check, so that two runs racing each other still get a file each.
    newline="" keeps the CRLF endings already in the string from being translated again.
    """
    candidate, index = path, 0
    while True:
        try:
            handle = os.open(candidate, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
        except FileExistsError:
            index += 1
            candidate = f"{path}.{index}"
            continue
        with os.fdopen(handle, "w", encoding="utf-8", newline="") as stream:
            stream.write(xml)
        return candidate


def report_custom_field_definitions(
    definitions: list[dict], dropped: list[tuple[dict, str]]
) -> None:
    """List the fields left out of the XML, and the ones whose definition is a guess."""
    if dropped:
        log("")
        log(f"  {len(dropped)} field(s) deliberately NOT included:")
        for row, reason in dropped:
            log(f"    {row['level']:8s} {row['short_name']:34s} {reason}")
    review = [definition for definition in definitions if definition["needs_review"]]
    if review:
        log("")
        log(f"  {len(review)} definition(s) carry a REVIEW comment and need checking before you commit:")
        for definition in review:
            log(f"    {definition['attributes']['class']:19s} {definition['attributes']['name']}")


def log_custom_properties_xml(xml: str) -> None:
    """Print the XML between rules, so it can be read or copied straight out of the run."""
    log("")
    log(f"--- {CUSTOM_PROPERTIES_FILENAME} " + "-" * 44)
    # Printed with the platform's own line endings; a written file keeps the CRLF FieldWorks uses.
    log(xml.replace(CUSTOM_PROPERTIES_EOL, "\n"))
    log("-" * 78)


def emit_custom_properties(
    definitions: list[dict],
    dropped: list[tuple[dict, str]],
    new_code: str,
    lexbox_code: str,
    lexbox_host: str,
) -> str:
    """Write and print FLExProject.CustomProperties, and say what the human has to do with it."""
    xml = build_custom_properties_xml(definitions)
    path = write_custom_properties(xml, f"{new_code}.{CUSTOM_PROPERTIES_FILENAME}")

    log("")
    log("=" * 78)
    log(f"STOPPING: {len(definitions)} custom field definition(s) must exist in FieldWorks first.")
    log("=" * 78)
    log("")
    log("LfMerge does not create custom fields -- it skips them, and the data in them, with")
    log("\"Custom field X from LF skipped, because we're not yet creating new custom fields in")
    log("LCM\". The first Send/Receive is the only pass that would carry this project's data, so")
    log("the definitions have to be in the repository before it runs. Nothing has been pushed.")
    log("")
    log(f"Written to: {os.path.abspath(path)}")

    report_custom_field_definitions(definitions, dropped)

    scheme, host = split_lexbox_host(lexbox_host)
    log("")
    log("To create them, commit the file to the project's Mercurial repository:")
    log(f"    hg clone {scheme}://{host}/hg/{lexbox_code} {lexbox_code}")
    log(f"    cp {path} {lexbox_code}/{CUSTOM_PROPERTIES_FILENAME}")
    log(f"    cd {lexbox_code} && hg commit -m 'Add custom fields' && hg push")

    log_custom_properties_xml(xml)
    return path


def count_anchor_writing_system_usage(config: Config, db_name: str) -> dict[str, dict]:
    """How many entries hold data in each writing system, split by vernacular or analysis field.

    Returns {tag: {"vernacular": n, "analysis": n}}, counting entries rather than values so a
    writing system used three times in one entry still counts once, the same way the custom field
    scan counts.

    The fields are the ones whose role is not in doubt:

        vernacular  lexeme, citationForm, senses.examples.sentence
        analysis    senses.definition, senses.gloss, senses.examples.translation

    etymology is deliberately absent. In the 2026-07-06 corpus 741 projects configure it with
    analysis writing systems and 378 with vernacular ones, so it is evidence of nothing.
    """
    js = f"""
const target = db.getSiblingDB({json.dumps(db_name)});
""" + """
const counts = {};

function isFilled(alternative) {
  return alternative !== null && typeof alternative === "object"
    && alternative.value !== null && alternative.value !== undefined && alternative.value !== "";
}

// Records into a per-entry set, so an entry using a writing system repeatedly counts once.
function record(multitext, side, seen) {
  if (!multitext || typeof multitext !== "object") return;
  Object.keys(multitext).forEach(function (ws) {
    if (isFilled(multitext[ws])) seen[side][ws] = true;
  });
}

if (target.getCollectionNames().indexOf("lexicon") !== -1) {
  target.lexicon.find({}).forEach(function (doc) {
    const seen = { vernacular: {}, analysis: {} };
    record(doc.lexeme, "vernacular", seen);
    record(doc.citationForm, "vernacular", seen);
    (doc.senses || []).forEach(function (sense) {
      if (!sense || typeof sense !== "object") return;
      record(sense.definition, "analysis", seen);
      record(sense.gloss, "analysis", seen);
      (sense.examples || []).forEach(function (example) {
        if (!example || typeof example !== "object") return;
        record(example.sentence, "vernacular", seen);
        record(example.translation, "analysis", seen);
      });
    });
    ["vernacular", "analysis"].forEach(function (side) {
      Object.keys(seen[side]).forEach(function (ws) {
        if (!counts[ws]) counts[ws] = { vernacular: 0, analysis: 0 };
        counts[ws][side] += 1;
      });
    });
  });
}

print(EJSON.stringify(counts));
"""
    return mongosh_json(config, js, what=f"Counting writing system usage in {db_name}")


def classify_writing_systems(
    found: dict[str, list[str]],
    override_vernacular: list[str] | None = None,
    override_analysis: list[str] | None = None,
    anchor_counts: dict[str, dict] | None = None,
) -> tuple[list[str], list[str], list[str]]:
    """Split the project's writing systems into vernacular and analysis.

    Returns (vernacular, analysis, unclassified).

    Every writing system the project knows about has to reach the FieldWorks
    project, or data in it could not sync. Anything that is neither vernacular
    nor analysis by the field conventions is reported as `unclassified` and
    appended to the analysis list, which is the safer of the two: an extra
    analysis writing system is inert, whereas a missing one loses data.

    The overrides replace the derived base lists, but coverage still applies --
    uncovered writing systems are appended to analysis either way, since the
    whole point of the check is that the union is complete.

    A writing system in both lists is then removed from one of them, so that each writing system
    has a single role in the new FieldWorks project. LF has no such constraint, so the overlap is
    common: one project lists "rw" and "en" in its lexeme field and both again in its
    definition. A writing system in both lists also tells nothing about the role of any field that
    uses it, which is what leaves custom field wsSelectors undecidable.

    Which list it leaves is decided by `anchor_counts` -- where its data actually is, per
    count_anchor_writing_system_usage -- and not by which field the config declares it on, since a
    declaration can rest on a single stray value. Without counts, or on a tie, vernacular keeps it.
    The vernacular list is never emptied, since LexBox requires one, and an explicitly overridden
    list is never trimmed: --ws-vernacular and --ws-analysis say what the lists are to be.
    VERNACULAR_ANALYSIS_OVERLAP_EXEMPTION is never removed from analysis.

    If the analysis list leads with an unlisted-language (qaa) writing system it
    is reordered to lead with ANTHRO_DEFAULT_ANALYSIS_WS instead, and says so in
    the log. The first entry becomes the new FieldWorks project's default
    analysis writing system, and liblcm cannot write the anthropology list in a
    qaa one. `en` is added if the project does not have it; an extra analysis
    writing system is inert, and without it the project cannot be created. Any
    other leading writing system is left where the project put it.
    """
    if override_vernacular:
        vernacular = dedup(override_vernacular)
    else:
        vernacular = dedup(found["lexeme"] + found["citationForm"])

    if override_analysis:
        analysis = dedup(override_analysis)
    else:
        analysis = dedup(found["definition"] + found["gloss"])

    every = dedup(found["config_all"] + found["declared"])
    classified = set(vernacular) | set(analysis)
    unclassified = [tag for tag in every if tag not in classified]
    if unclassified:
        analysis = dedup(analysis + unclassified)

    # Before the qaa check below, so that runs against the list the project will actually get.
    counts = anchor_counts or {}
    for tag in [tag for tag in analysis if tag in set(vernacular)]:
        usage = counts.get(tag) or {}
        in_vernacular = usage.get("vernacular", 0)
        in_analysis = usage.get("analysis", 0)
        evidence = f"{in_vernacular} vernacular vs {in_analysis} analysis entries"

        # Whichever side holds less of the writing system's data is the side it leaves. A tie --
        # which includes a writing system with no data at all -- leaves the vernacular list alone.
        leaves = "vernacular" if in_analysis > in_vernacular else "analysis"
        keep_reason = None
        forced_reason = None

        if override_vernacular and override_analysis:
            keep_reason = "both lists were given explicitly"
        elif leaves == "vernacular" and override_vernacular:
            leaves = "analysis"
            forced_reason = "--ws-vernacular says what the vernacular list is to be"
        elif leaves == "analysis" and override_analysis:
            leaves = "vernacular"
            forced_reason = "--ws-analysis says what the analysis list is to be"

        # LexBox requires a vernacular writing system, so the last one never leaves that list.
        if keep_reason is None and leaves == "vernacular" and len(vernacular) == 1:
            leaves = "analysis"
            forced_reason = "it is the project's only vernacular writing system, which LexBox requires"

        # The anthropology list can only be written in this one, so it never leaves analysis.
        if keep_reason is None and leaves == "analysis" and tag == VERNACULAR_ANALYSIS_OVERLAP_EXEMPTION:
            keep_reason = "the anthropology list needs it and can be written in no other"

        if keep_reason is not None:
            log(f"  NOTE: '{tag}' is in both writing system lists ({evidence}); left in both,")
            log(f"        because {keep_reason}.")
            continue

        if leaves == "vernacular":
            vernacular = [item for item in vernacular if item != tag]
        else:
            analysis = [item for item in analysis if item != tag]

        # Compare against the side it actually left, not the side the data preferred: a guard above
        # may have overruled the data, and saying "where less of its data is" would then be false.
        left_behind = in_vernacular if leaves == "vernacular" else in_analysis
        kept = in_analysis if leaves == "vernacular" else in_vernacular
        log(f"  NOTE: '{tag}' was in both writing system lists ({evidence}); removed from {leaves},")
        if left_behind > kept:
            because = f", because {forced_reason}" if forced_reason else ""
            log(f"        even though that is where more of its data is{because}.")
        else:
            log("        which is where less of its data is.")

    if not analysis:
        log("  WARNING: no analysis writing systems are left. LexBox will fall back to")
        log(f"           '{ANTHRO_DEFAULT_ANALYSIS_WS}'; pass --ws-analysis to choose instead.")

    # Last, because the first analysis writing system is the one liblcm writes the anthropology
    # list in, and it cannot write it in a qaa one. Applied even to an explicit --ws-analysis: the
    # constraint is liblcm's, not a preference, and getting it wrong fails the whole creation.
    if analysis and analysis[0].lower().startswith(UNLISTED_LANGUAGE_PREFIX):
        leading = analysis[0]
        analysis = [ANTHRO_DEFAULT_ANALYSIS_WS] + [
            tag for tag in analysis if tag != ANTHRO_DEFAULT_ANALYSIS_WS
        ]
        log(f"  NOTE: analysis writing systems led with '{leading}'; moved "
            f"'{ANTHRO_DEFAULT_ANALYSIS_WS}' to the front so that the new project has a default")
        log("        analysis writing system the anthropology list can be written in.")

    return vernacular, analysis, unclassified


def count_collections(config: Config, db_name: str) -> int:
    js = f"""
print(JSON.stringify({{ count: db.getSiblingDB({json.dumps(db_name)}).getCollectionNames().length }}));
"""
    return int(mongosh_json(config, js, what=f"Inspecting database {db_name}")["count"])


def copy_project_database(config: Config, source_db: str, target_db: str, *, drop: bool) -> None:
    """Copy every collection and index of source_db into target_db.

    Uses mongodump piped through mongorestore --nsFrom/--nsTo so that BSON
    types, indexes and collection options are preserved exactly -- no
    document-by-document marshalling as backup.mjs has to do.
    """
    require_tool("mongodump")
    require_tool("mongorestore")

    with tempfile.TemporaryDirectory(prefix="lf-migrate-") as tmpdir:
        archive = os.path.join(tmpdir, f"{source_db}.archive")

        log(f"  dumping {source_db}...")
        run(
            ["mongodump", f"--uri={config.uri(source_db)}", f"--archive={archive}", "--quiet"],
            what=f"mongodump of {source_db}",
        )

        if not os.path.exists(archive) or os.path.getsize(archive) == 0:
            log(f"  {source_db} is empty; nothing to restore")
            return

        log(f"  restoring into {target_db}...")
        cmd = [
            "mongorestore",
            f"--uri={config.uri()}",
            f"--archive={archive}",
            f"--nsFrom={source_db}.*",
            f"--nsTo={target_db}.*",
            "--quiet",
        ]
        if drop:
            cmd.append("--drop")
        run(cmd, what=f"mongorestore into {target_db}")


# A numeric BSON value does not always reach mongosh as a JS number: int32 and
# double do, but int64 and decimal arrive as wrapper objects. Shared by both
# coercion scripts below, which is why it is a separate string and not inlined.
NUMERIC_HELPERS_JS = """
function isNumeric(value) {
  if (typeof value === "number") return true;
  if (value === null || typeof value !== "object") return false;
  const kind = value._bsontype;
  return kind === "Int32" || kind === "Long" || kind === "Double" || kind === "Decimal128";
}

function asString(value) {
  return typeof value === "number" ? String(value) : value.toString();
}
"""


def coerce_option_list_keys(config: Config, db_name: str) -> dict:
    """Rewrite every numeric option list item key in db_name as a string.

    Runs against the COPY, straight after the database duplication, so the
    original project keeps its integers. `items[].key` is the only field in an
    optionlists document that is ever numeric in the corpus; `defaultItemKey`
    names an item key too, so it is coerced alongside them, defensively -- no
    project in the 2026-07-06 dump has a numeric one.

    A coerced key that duplicates a key already in the same list would make that
    list ambiguous. No such case exists in the corpus, so this reports any it
    finds rather than refusing to migrate, and still performs the coercion.
    """
    js = f"""
const targetName = {json.dumps(db_name)};
""" + NUMERIC_HELPERS_JS + """
const target = db.getSiblingDB(targetName);

let lists = 0;
let listsChanged = 0;
let keysCoerced = 0;
let defaultKeysCoerced = 0;
const collisions = [];
const samples = [];

if (target.getCollectionNames().indexOf("optionlists") !== -1) {
  target.optionlists.find({}).forEach(function (doc) {
    lists += 1;

    const items = Array.isArray(doc.items) ? doc.items : [];
    // Keys already spoken for, so a coerced key landing on one of them can be
    // spotted instead of silently creating a duplicate.
    const taken = new Set();
    items.forEach(function (item) {
      if (item && typeof item.key === "string") taken.add(item.key);
    });

    let coercedHere = 0;
    const newItems = items.map(function (item) {
      if (!item || !isNumeric(item.key)) return item;
      const key = asString(item.key);
      if (taken.has(key)) {
        collisions.push({ code: doc.code, key: key, value: item.value });
      }
      taken.add(key);
      coercedHere += 1;
      if (samples.length < 5) {
        samples.push({ code: doc.code, key: key, value: item.value });
      }
      // Object.assign keeps the field order, and `key` already exists on the
      // item, so it is replaced in place rather than moved to the end.
      return Object.assign({}, item, { key: key });
    });

    const update = {};
    if (coercedHere > 0) {
      update.items = newItems;
      keysCoerced += coercedHere;
    }
    if (isNumeric(doc.defaultItemKey)) {
      update.defaultItemKey = asString(doc.defaultItemKey);
      defaultKeysCoerced += 1;
    }
    if (Object.keys(update).length > 0) {
      target.optionlists.updateOne({ _id: doc._id }, { $set: update });
      listsChanged += 1;
    }
  });
}

print(EJSON.stringify({
  lists: lists,
  listsChanged: listsChanged,
  keysCoerced: keysCoerced,
  defaultKeysCoerced: defaultKeysCoerced,
  collisions: collisions,
  samples: samples,
}));
"""
    result = mongosh_json(config, js, what=f"Coercing option list keys in {db_name}")

    log(f"  {result['lists']} option list(s) examined")
    if result["keysCoerced"]:
        log(f"  {result['keysCoerced']} numeric key(s) coerced to strings "
            f"across {result['listsChanged']} list(s)")
        for sample in result["samples"]:
            log(f"    {sample['code']}: {sample['key']!r} ({sample['value']})")
    else:
        log("  no numeric keys found; nothing to coerce")
    if result["defaultKeysCoerced"]:
        log(f"  {result['defaultKeysCoerced']} numeric defaultItemKey(s) coerced")
    if result["collisions"]:
        log("")
        log("WARNING: coercing produced a key that the list already had as a string.")
        log("         The list now has two items with the same key, and a reference to")
        log("         it is ambiguous. Inspect these before pushing to LexBox:")
        for collision in result["collisions"]:
            log(f"           {collision['code']}: key {collision['key']!r}")
        log("")
    return result


def coerce_special_lexicon_references(config: Config, db_name: str, source_code: str) -> dict:
    """Coerce the two known numeric lexicon references, and report any others.

    Only the sense named in SPECIAL_LEXICON_INT_REFERENCES for this project code
    is rewritten, and only when its `values` list is exactly the expected one.
    Every other numeric reference -- in another project, another field, or a
    values list that does not match -- is counted and reported, never touched.

    Nothing here matters unless coerce_option_list_keys has already run: it is
    the list-side coercion that leaves these two references dangling.
    """
    special = SPECIAL_LEXICON_INT_REFERENCES.get(source_code)
    field, expected = special if special else ("", [])

    js = f"""
const targetName = {json.dumps(db_name)};
const specialField = {json.dumps(field)};
const specialValues = {json.dumps(expected)};
""" + NUMERIC_HELPERS_JS + """
const target = db.getSiblingDB(targetName);

// Exact match against the expected list: same length, every entry numeric, and
// every entry the same number. That is what makes this a special case for two
// known senses rather than a blanket lexicon rewrite.
function isSpecialList(values) {
  if (!specialField || specialValues.length === 0) return false;
  if (!Array.isArray(values) || values.length !== specialValues.length) return false;
  for (let index = 0; index < values.length; index += 1) {
    if (!isNumeric(values[index])) return false;
    if (asString(values[index]) !== String(specialValues[index])) return false;
  }
  return true;
}

let entriesChanged = 0;
let valuesCoerced = 0;
const coerced = [];
const untouched = [];

if (target.getCollectionNames().indexOf("lexicon") !== -1) {
  // Only `senses` is read or written, so leave the rest of each entry on the
  // server -- a lexicon can run to tens of thousands of documents.
  target.lexicon.find({}, { senses: 1 }).forEach(function (doc) {
    const senses = Array.isArray(doc.senses) ? doc.senses : [];
    let changed = false;

    senses.forEach(function (sense, senseIndex) {
      if (!sense || typeof sense !== "object") return;
      Object.keys(sense).forEach(function (fieldName) {
        const holder = sense[fieldName];
        if (!holder || typeof holder !== "object" || !Array.isArray(holder.values)) return;
        if (!holder.values.some(isNumeric)) return;

        const shown = holder.values.map(function (value) {
          return isNumeric(value) ? asString(value) : value;
        });

        if (fieldName !== specialField || !isSpecialList(holder.values)) {
          untouched.push({
            entry: doc._id.toString(),
            sense: senseIndex,
            field: fieldName,
            values: shown,
          });
          return;
        }

        holder.values = holder.values.map(function (value) {
          return isNumeric(value) ? asString(value) : value;
        });
        valuesCoerced += holder.values.length;
        coerced.push({
          entry: doc._id.toString(),
          sense: senseIndex,
          field: fieldName,
          values: shown,
        });
        changed = true;
      });
    });

    if (changed) {
      target.lexicon.updateOne({ _id: doc._id }, { $set: { senses: senses } });
      entriesChanged += 1;
    }
  });
}

print(EJSON.stringify({
  entriesChanged: entriesChanged,
  valuesCoerced: valuesCoerced,
  coerced: coerced,
  untouched: untouched,
}));
"""
    result = mongosh_json(config, js, what=f"Coercing lexicon references in {db_name}")

    if special:
        log(f"  {source_code!r} is a known special case: "
            f"{field}.values == {expected}")
    if result["coerced"]:
        for record in result["coerced"]:
            log(f"  coerced entry {record['entry']} sense #{record['sense']} "
                f"{record['field']}.values {record['values']} -> strings")
        log(f"  {result['valuesCoerced']} value(s) in {result['entriesChanged']} entry/entries")
    elif special:
        log("  expected special-case sense was NOT found; nothing coerced")
        log("  (the project data may have changed since the dump this was derived from)")
    else:
        log("  not a special-case project; no lexicon value was changed")

    if result["untouched"]:
        log("")
        log(f"WARNING: {len(result['untouched'])} numeric option list reference(s) in the")
        log("         lexicon were left as they are, because they are not one of the two")
        log("         known special cases. They will not resolve against the coerced")
        log("         option lists. Add them to SPECIAL_LEXICON_INT_REFERENCES if they")
        log("         should be converted too:")
        for record in result["untouched"][:10]:
            log(f"           entry {record['entry']} sense #{record['sense']} "
                f"{record['field']}.values = {record['values']}")
        if len(result["untouched"]) > 10:
            log(f"           ... and {len(result['untouched']) - 10} more")
        log("")
    return result



def find_empty_entry_guids(config: Config, db_name: str) -> list[dict]:
    """Return the lexicon entries in db_name whose guid is an empty string.

    Matches `guid: ""` exactly, because that is the only shape the problem takes
    in the 2026-07-06 corpus: five projects with one such entry each, no nulls,
    no missing guid fields and no malformed values. An entry whose guid is
    merely unusual -- a UUID that is not version 4, say -- is left alone, since
    LfMerge parses it happily.

    The lexeme form comes back with each hit purely so the log can name the
    entry instead of only its ObjectId. Read-only, so it is safe to point at the
    source database to preview what a run would do.
    """
    js = f"""
const target = db.getSiblingDB({json.dumps(db_name)});
const found = [];
if (target.getCollectionNames().indexOf("lexicon") !== -1) {{
  target.lexicon.find({{ guid: "" }}, {{ lexeme: 1 }}).forEach(function (doc) {{
    // lexeme is a multitext, {{ "<ws>": {{ "value": "..." }} }}. Any one form is
    // enough to identify the entry in a log line.
    let label = "";
    const lexeme = doc.lexeme || {{}};
    Object.keys(lexeme).forEach(function (ws) {{
      if (!label && lexeme[ws] && lexeme[ws].value) {{
        label = ws + ": " + lexeme[ws].value;
      }}
    }});
    found.push({{ id: doc._id.toString(), label: label }});
  }});
}}
print(EJSON.stringify({{ found: found }}));
"""
    return list(mongosh_json(config, js, what=f"Finding empty entry guids in {db_name}")["found"])


def fix_empty_entry_guids(config: Config, db_name: str) -> dict:
    """Give every lexicon entry with an empty-string guid a fresh UUID4.

    Runs against the COPY, so the original project keeps its empty guid.

    An empty guid does not make LfMerge fail, which is why it goes unnoticed.
    LfMerge reads the field with Guid.TryParse (MongoConnection.CanParseGuid),
    so such an entry is quietly dropped from the ObjectId->Guid map that
    comments are attached by, and ConvertMongoToLcmLexicon then falls back to
    `lfEntry.Guid ?? Guid.Empty`. The entry would be created in FieldWorks under
    the all-zeros GUID, and any later entry in the same state would find that
    object and overwrite it instead of creating its own. Fixing this before the
    first Send/Receive is what keeps the entries distinct.

    The new guids are generated here rather than in mongosh: uuid.uuid4()
    produces exactly what Guid::create() does in PHP -- lowercase, hyphenated,
    version 4 -- which is the only form Guid::isValid accepts. mongosh's UUID()
    would produce BSON binary, the wrong type for this field.

    Only `guid` is written. dateModified and dirtySR are left alone: restoring an
    identity is not a content edit, and touching them would misreport when the
    entry was last worked on.
    """
    entries = find_empty_entry_guids(config, db_name)
    if not entries:
        log("  no entries with an empty guid")
        return {"fixed": 0, "assignments": []}

    # The unique {guid: 1} index (LexEntryModel.php:515) would reject a duplicate
    # part way through the batch, so make sure this batch is distinct with itself.
    seen: set[str] = set()
    assignments = []
    for entry in entries:
        guid = str(uuid.uuid4())
        while guid in seen:
            guid = str(uuid.uuid4())
        seen.add(guid)
        assignments.append({"id": entry["id"], "guid": guid, "label": entry.get("label", "")})

    js = f"""
const target = db.getSiblingDB({json.dumps(db_name)});
const assignments = {json.dumps(assignments)};
const updated = [];
const collisions = [];

assignments.forEach(function (assignment) {{
  // Cheap insurance: a collision would be unrecoverable half way through a
  // batch, and this costs one indexed lookup per entry.
  if (target.lexicon.findOne({{ guid: assignment.guid }}) !== null) {{
    collisions.push(assignment.guid);
    return;
  }}
  // The guid: "" in the filter means a document that somehow already got a
  // guid is left alone rather than overwritten.
  const result = target.lexicon.updateOne(
    {{ _id: new ObjectId(assignment.id), guid: "" }},
    {{ $set: {{ guid: assignment.guid }} }}
  );
  if (result.modifiedCount === 1) {{
    updated.push(assignment.id);
  }}
}});

print(EJSON.stringify({{ updated: updated, collisions: collisions }}));
"""
    result = mongosh_json(config, js, what=f"Assigning entry guids in {db_name}")

    if result["collisions"]:
        raise Fatal(
            "generated a guid that the lexicon already contains, which should not be possible: "
            + ", ".join(result["collisions"])
        )
    if len(result["updated"]) != len(assignments):
        raise Fatal(
            f"expected to give guids to {len(assignments)} entry/entries but updated "
            f"{len(result['updated'])}; the copy may have changed underneath us"
        )

    for assignment in assignments:
        label = f" ({assignment['label']})" if assignment["label"] else ""
        log(f"  entry {assignment['id']}{label} -> {assignment['guid']}")
    log(f"  {len(assignments)} empty guid(s) replaced")
    return {"fixed": len(assignments), "assignments": assignments}


def create_project_record(
    config: Config,
    source_code: str,
    new_code: str,
    new_name: str,
    identifier: str,
    renames: list[dict] | None = None,
) -> str:
    """Insert the copied project document and register it with its members.

    Returns the new project's _id as a hex string. Called AFTER the project
    database has been copied, so there is never a window in which the project
    exists but its lexicon database does not (same ordering as backup.mjs).

    `renames` applies custom field renames to the copied config. It has to happen here rather than
    in a step of its own because the document is copied wholesale from the source, config included,
    so this is the only moment at which the new project's config exists but nothing has read it.
    A custom field name appears in the config both as a key -- under entry.fields, senses.fields and
    each roleViews.<role>.fields -- and as a value, in the fieldOrder lists, so both are rewritten.
    """
    js = f"""
const main = db.getSiblingDB({json.dumps(config.database)});
const renames = {json.dumps(renames or [])};
const doc = main.projects.findOne({{ projectCode: {json.dumps(source_code)} }});
if (doc === null) {{
  throw new Error("source project disappeared: " + {json.dumps(source_code)});
}}

delete doc._id;

// Rename custom fields wherever the config mentions them, as a key or as a fieldOrder entry.
// Object.keys() is a snapshot, so re-keying while walking it is safe.
function renameThroughout(node, oldKey, newKey) {{
  if (Array.isArray(node)) {{
    for (let i = 0; i < node.length; i++) {{
      if (node[i] === oldKey) {{ node[i] = newKey; }}
      else {{ renameThroughout(node[i], oldKey, newKey); }}
    }}
  }} else if (node !== null && typeof node === "object") {{
    Object.keys(node).forEach(function (key) {{
      if (key === oldKey) {{
        node[newKey] = node[key];
        delete node[key];
        renameThroughout(node[newKey], oldKey, newKey);
      }} else {{
        renameThroughout(node[key], oldKey, newKey);
      }}
    }});
  }}
}}
// A field whose label still reads the old name is only half renamed, and the label is what LF
// shows and what this script would emit as the FieldWorks helpString. Only a label that matches
// the old name is rewritten, so a label somebody deliberately set to something else survives.
function relabel(node, key, oldLabel, newLabel) {{
  if (Array.isArray(node)) {{
    node.forEach(function (item) {{ relabel(item, key, oldLabel, newLabel); }});
  }} else if (node !== null && typeof node === "object") {{
    Object.keys(node).forEach(function (k) {{
      const child = node[k];
      if (k === key && child !== null && typeof child === "object" && child.label === oldLabel) {{
        child.label = newLabel;
      }}
      relabel(child, key, oldLabel, newLabel);
    }});
  }}
}}
let configKeysRenamed = 0;
renames.forEach(function (rename) {{
  const before = JSON.stringify(doc.config || {{}});
  renameThroughout(doc.config, rename.old_key, rename.new_key);
  relabel(doc.config, rename.new_key, rename.old_name, rename.new_name);
  if (JSON.stringify(doc.config || {{}}) !== before) {{ configKeysRenamed += 1; }}
}});
doc.projectCode = {json.dumps(new_code)};
doc.projectName = {json.dumps(new_name)};
// Point the copy at its own (new) Send/Receive project. The identifier is
// derived from the projectCode but normalised for LexBox, so the two differ
// whenever the projectCode has capitals or underscores.
doc.sendReceiveProjectIdentifier = {json.dumps(identifier)};

const inserted = main.projects.insertOne(doc);
const newId = inserted.insertedId;

// Give every member of the original project access to the copy as well.
const memberIds = Object.keys(doc.users || {{}}).map((id) => new ObjectId(id));
let membersUpdated = 0;
if (memberIds.length) {{
  membersUpdated = main.users.updateMany(
    {{ _id: {{ $in: memberIds }} }},
    {{ $addToSet: {{ projects: newId }} }}
  ).modifiedCount;
}}

print(EJSON.stringify({{
  id: newId.toString(),
  membersUpdated: membersUpdated,
  configKeysRenamed: configKeysRenamed,
}}));
"""
    result = mongosh_json(config, js, what="Creating project record")
    log(f"  new project _id: {result['id']}")
    log(f"  granted access to {result['membersUpdated']} member(s)")
    if renames:
        renamed = result.get("configKeysRenamed", 0)
        log(f"  renamed {renamed} custom field(s) in the copied config")
        if renamed != len(renames):
            raise Fatal(
                f"expected to rename {len(renames)} custom field(s) in the config but changed "
                f"{renamed}; the project config is not shaped as this script expects"
            )
    return result["id"]


def delete_project_record(config: Config, project_id: str) -> None:
    mongosh_json(
        config,
        f"""
const main = db.getSiblingDB({json.dumps(config.database)});
const doomed = new ObjectId({json.dumps(project_id)});
main.users.updateMany({{ projects: doomed }}, {{ $pull: {{ projects: doomed }} }});
main.projects.deleteOne({{ _id: doomed }});
print(JSON.stringify({{ ok: 1 }}));
""",
        what="Removing project record",
    )


# --------------------------------------------------------------------------- #
# asset steps
# --------------------------------------------------------------------------- #


def stage_assets(config: Config, app_name: str, source_db: str, target_db: str) -> str | None:
    """Copy audio/pictures to the new project's own assets folder, as real dirs.

    A non-Send/Receive project keeps these as ordinary directories
    (LexProjectModel::createAssetsFolders takes its `else` branch), so this is a
    plain recursive copy. Symlinks are dereferenced anyway, defensively: they
    may exist and even be broken if the project was ever converted
    (cf. `tar chf` in backup.mjs).

    These directories are turned into symlinks into the webwork tree later, by
    link_assets_into_webwork(), once the first Send/Receive has created it.
    """
    source_dir = config.assets_path(app_name, source_db)
    target_dir = config.assets_path(app_name, target_db)

    if not os.path.isdir(source_dir):
        log(f"  no assets directory at {source_dir}; skipping")
        return None

    os.makedirs(target_dir, exist_ok=True)
    total = 0
    for subfolder, _ in ASSET_LINKED_FILES:
        source_sub = os.path.join(source_dir, subfolder)
        target_sub = os.path.join(target_dir, subfolder)
        # os.path.isdir follows symlinks and is False for a broken one.
        if not os.path.isdir(source_sub):
            log(f"  {subfolder}: missing or broken symlink; creating empty directory")
            os.makedirs(target_sub, exist_ok=True)
            continue
        if os.path.exists(target_sub) or os.path.islink(target_sub):
            if os.path.islink(target_sub):
                os.unlink(target_sub)
            else:
                shutil.rmtree(target_sub)
        shutil.copytree(source_sub, target_sub, symlinks=False)
        count = sum(len(files) for _, _, files in os.walk(target_sub))
        log(f"  {subfolder}: {count} file(s) copied")
        total += count

    chown_to_web_user(target_dir)
    if total == 0:
        log("  (source project had no asset files)")
    return target_dir


def copy_missing_files(source_dir: str, target_dir: str) -> tuple[int, int]:
    """Recursively copy files from source_dir into target_dir, skipping existing.

    "Any assets NOT found in the LinkedFiles folder get copied in" -- anything
    the Send/Receive already brought down wins, so a re-run is a no-op.
    """
    copied = skipped = 0
    for root, _dirnames, filenames in os.walk(source_dir):
        relative = os.path.relpath(root, source_dir)
        destination_root = target_dir if relative == "." else os.path.join(target_dir, relative)
        os.makedirs(destination_root, exist_ok=True)
        for name in filenames:
            destination = os.path.join(destination_root, name)
            if os.path.exists(destination):
                skipped += 1
            else:
                shutil.copy2(os.path.join(root, name), destination)
                copied += 1
    return copied, skipped


def link_assets_into_webwork(config: Config, app_name: str, target_db: str, new_code: str) -> None:
    """Move staged assets into the webwork LinkedFiles tree and symlink to them.

    This is the Python equivalent of
    LexProjectModel::moveExistingFilesAndCreateSymlink, and leaves the copy with
    the on-disk layout a real Send/Receive project has:

        assets/<app>/sf_<code>/audio    -> webwork/<code>/LinkedFiles/AudioVisual
        assets/<app>/sf_<code>/pictures -> webwork/<code>/LinkedFiles/Pictures

    Must run AFTER the first Send/Receive, which is what creates webwork/<code>.
    """
    webwork = config.webwork_path(new_code)
    if not os.path.isdir(webwork):
        raise Fatal(
            f"Send/Receive work folder {webwork} does not exist. The first Send/Receive "
            "does not appear to have cloned the project, so there is nowhere to put the "
            "assets. Check `docker compose logs lfmerge`."
        )

    assets_dir = config.assets_path(app_name, target_db)
    for subfolder, linked_subfolder in ASSET_LINKED_FILES:
        asset_path = os.path.join(assets_dir, subfolder)
        linked_path = os.path.join(config.linked_files_path(new_code), linked_subfolder)

        os.makedirs(linked_path, exist_ok=True)

        if os.path.islink(asset_path):
            if os.path.realpath(asset_path) == os.path.realpath(linked_path):
                log(f"  {subfolder}: already symlinked into webwork")
                continue
            log(f"  {subfolder}: replacing symlink to {os.path.realpath(asset_path)}")
            os.unlink(asset_path)
        elif os.path.isdir(asset_path):
            copied, skipped = copy_missing_files(asset_path, linked_path)
            log(f"  {subfolder}: {copied} file(s) moved into webwork, {skipped} already there")
            shutil.rmtree(asset_path)
        elif os.path.exists(asset_path):
            os.unlink(asset_path)
        else:
            log(f"  {subfolder}: nothing staged")

        os.makedirs(os.path.dirname(asset_path), exist_ok=True)
        os.symlink(linked_path, asset_path)

    # LFMerge commits these as www-data, so it must own them.
    chown_to_web_user(config.linked_files_path(new_code))
    chown_to_web_user(assets_dir)


# --------------------------------------------------------------------------- #
# send/receive steps
# --------------------------------------------------------------------------- #


def split_lexbox_host(host: str) -> tuple[str, str]:
    """Split a --lexbox-host value into (scheme, netloc).

    A bare host like "lexbox.org" gets https, since LexBox communication is over
    HTTPS. An explicit scheme is honoured, which is how a development LexBox is
    reached: it serves plain HTTP, with no certificate at all.
    """
    raw = (host or "").strip().rstrip("/")
    if not raw:
        raise Fatal("--lexbox-host must not be empty")
    if "//" in raw:
        parts = urlsplit(raw)
        scheme, netloc = (parts.scheme or "https"), parts.netloc
    else:
        scheme, netloc = "https", raw
    if not netloc:
        raise Fatal(f"could not parse a hostname out of --lexbox-host {host!r}")
    if scheme not in ("http", "https"):
        raise Fatal(f"unsupported scheme {scheme!r} in --lexbox-host {host!r}")
    return scheme, netloc


class LexboxClient:
    """Minimal LexBox API client, standard library only.

    Login is POST /api/login (LoginController.cs:21 sets the route to /api/login,
    and the action has a bare [HttpPost]). The response BODY is the LexAuthUser
    record; the JWT itself comes back only as the `.LexBoxAuth` cookie, because
    the controller calls HttpContext.SignInAsync and AuthKernel.cs:229 replaces
    the cookie ticket format with a JWT writer.
    """

    def __init__(
        self,
        host: str,
        username: str,
        password: str,
        *,
        auth_mode: str = "cookie",
        timeout: int = DEFAULT_LEXBOX_TIMEOUT_SECONDS,
    ) -> None:
        self.scheme, self.netloc = split_lexbox_host(host)
        self.base_url = f"{self.scheme}://{self.netloc}"
        self.hostname = urlsplit(f"//{self.netloc}").hostname or self.netloc
        self.username = username
        self.password = password
        self.auth_mode = auth_mode
        self.timeout = timeout
        self.cookie_jar = http.cookiejar.CookieJar()
        self.jwt: str | None = None

    # -- transport --------------------------------------------------------- #

    @property
    def is_localhost(self) -> bool:
        """True for localhost and any name under the reserved .localhost TLD.

        The subdomains matter because a development LexBox is reached at
        admin.localhost, not localhost. RFC 6761 reserves .localhost for local
        use, so treating the whole family as local cannot loosen anything for a
        real host such as lexbox.org.
        """
        host = (self.hostname or "").lower()
        return host == "localhost" or host.endswith(".localhost")

    def ssl_context(self) -> ssl.SSLContext:
        """Verify certificates everywhere except the localhost family.

        A local dev LexBox may present a self-signed certificate, which is
        accepted if and only if the host is localhost or a .localhost subdomain.
        For any other host the full chain and hostname are verified, so a
        self-signed or mismatched certificate is refused.
        """
        context = ssl.create_default_context()
        if self.is_localhost:
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
        return context

    def _opener(self) -> urllib.request.OpenerDirector:
        return urllib.request.build_opener(
            urllib.request.HTTPSHandler(context=self.ssl_context()),
            urllib.request.HTTPCookieProcessor(self.cookie_jar),
        )

    def _send(
        self,
        method: str,
        path: str,
        *,
        query: list[tuple[str, str]] | None = None,
        json_body: Any = None,
        authenticate: bool = False,
    ) -> tuple[int, Any, bytes]:
        params = list(query or [])
        headers: dict[str, str] = {}

        if authenticate:
            if not self.jwt:
                raise Fatal("internal error: authenticated request attempted before login")
            if self.auth_mode == "bearer":
                headers["Authorization"] = f"Bearer {self.jwt}"
            elif self.auth_mode == "jwt-query":
                params.append(("jwt", self.jwt))
            # "cookie" mode needs nothing: the CookieJar replays .LexBoxAuth.

        url = self.base_url + path
        if params:
            url += "?" + urlencode(params)

        data = None
        if json_body is not None:
            data = json.dumps(json_body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif method == "POST":
            data = b""  # POST with an empty body; everything is in the query string

        request = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with self._opener().open(request, timeout=self.timeout) as response:
                return response.status, response.headers, response.read()
        except urllib.error.HTTPError as exc:
            return exc.code, exc.headers, exc.read()
        except urllib.error.URLError as exc:
            hint = ""
            if isinstance(exc.reason, ssl.SSLError):
                hint = (
                    " (certificate rejected; self-signed certificates are only accepted "
                    "for localhost and .localhost subdomains)"
                )
            elif self.scheme == "https":
                hint = (
                    " (a development LexBox serves plain HTTP -- try "
                    f"--lexbox-host {DEFAULT_LEXBOX_HOST})"
                )
            raise Fatal(f"{method} {url} failed: {exc.reason}{hint}") from exc

    @staticmethod
    def _describe(status: int, body: bytes) -> str:
        """Pull `detail` out of an ASP.NET problem+json response."""
        text = body.decode("utf-8", errors="replace").strip()
        try:
            document = json.loads(text)
        except json.JSONDecodeError:
            return f"HTTP {status}: {text[:300]}"
        if isinstance(document, dict):
            detail = document.get("detail") or document.get("title")
            if detail:
                return f"HTTP {status}: {detail}"
        return f"HTTP {status}: {text[:300]}"

    # -- operations -------------------------------------------------------- #

    def login(self) -> str:
        """POST /api/login and return the JWT taken from the .LexBoxAuth cookie."""
        status, _headers, body = self._send(
            "POST",
            "/api/login",
            # defaultScope=true is required: with false the JWT carries no scopes
            # and every later call fails the LexboxApi scope requirement.
            query=[("defaultScope", "true")],
            json_body={
                "password": self.password,
                "emailOrUsername": self.username,
                "preHashedPassword": False,
            },
        )
        if status == 401:
            raise Fatal(f"LexBox rejected the credentials for user {self.username!r} (HTTP 401)")
        if status != 200:
            raise Fatal(f"LexBox login failed: {self._describe(status, body)}")

        for cookie in self.cookie_jar:
            if cookie.name == LEXBOX_AUTH_COOKIE:
                self.jwt = cookie.value
                break
        if not self.jwt:
            raise Fatal(
                f"LexBox login returned HTTP 200 but no {LEXBOX_AUTH_COOKIE} cookie, "
                "so no JWT could be obtained."
            )
        return self.jwt

    def init_fwdata_project(
        self,
        code: str,
        name: str,
        ws_vernacular: list[str],
        ws_analysis: list[str],
    ) -> str:
        """POST /api/project/initFwDataProject and return the new project GUID.

        Multi-valued writing systems are sent as repeated query parameters, which
        is how ASP.NET binds `[FromQuery] string[]` (ProjectController.cs:46-47).
        The endpoint is admin-only and NOT idempotent, so this never retries.
        """
        query: list[tuple[str, str]] = [("code", code)]
        query += [("wsVernacular", tag) for tag in ws_vernacular]
        query += [("wsAnalysis", tag) for tag in ws_analysis]
        if name:
            query.append(("name", name))

        status, _headers, body = self._send(
            "POST", "/api/project/initFwDataProject", query=query, authenticate=True
        )

        if status == 200:
            # ActionResult<Guid> serializes as a bare JSON string.
            guid = json.loads(body.decode("utf-8"))
            if not isinstance(guid, str) or not guid:
                raise Fatal(f"initFwDataProject returned an unexpected body: {body[:200]!r}")
            return guid

        if status in (401, 403):
            raise Fatal(
                f"initFwDataProject was refused ({self._describe(status, body)}). "
                f"It requires an admin account, and the JWT must be sent in a way LexBox accepts "
                f"(current --lexbox-auth={self.auth_mode})."
            )
        raise Fatal(f"initFwDataProject failed: {self._describe(status, body)}")


def init_lexbox_project(
    lexbox: LexboxClient,
    lexbox_code: str,
    new_name: str,
    ws_vernacular: list[str],
    ws_analysis: list[str],
) -> str:
    """Create the empty LexBox project that the copy will Send/Receive with.

    Logs in and calls initFwDataProject with the writing systems taken from the
    Language Forge project config. Returns the GUID it reports.

    `lexbox_code` is the project's sendReceiveProjectIdentifier, which is the
    normalised form of the Language Forge projectCode, not the projectCode
    itself.

    The project is created empty apart from the template .fwdata: the first
    Send/Receive is what pushes the lexicon from Mongo, and the second adds the
    assets.
    """
    if not ws_vernacular:
        raise Fatal(
            "LexBox requires at least one vernacular writing system, but the Language Forge "
            "project config has none (config.entry.fields.lexeme.inputSystems is empty). "
            "Pass --ws-vernacular explicitly."
        )

    if lexbox.scheme != "https":
        tls = "not in use (plain HTTP)"
    elif lexbox.is_localhost:
        tls = "self-signed certificates accepted (localhost family)"
    else:
        tls = "certificate will be verified"

    log(f"  LexBox at {lexbox.base_url}")
    log(f"  TLS: {tls}")
    log(f"  logging in as {lexbox.username!r}...")
    lexbox.login()
    log(f"  got JWT from the {LEXBOX_AUTH_COOKIE} cookie ({len(lexbox.jwt or '')} chars)")

    log(f"  creating project code={lexbox_code!r} name={new_name!r}")
    log(f"    wsVernacular: {', '.join(ws_vernacular)}")
    log(f"    wsAnalysis:   {', '.join(ws_analysis) or '(none -- LexBox will default to en)'}")
    guid = lexbox.init_fwdata_project(lexbox_code, new_name, ws_vernacular, ws_analysis)
    log(f"  LexBox project created, GUID {guid}")

    return guid


def read_sr_state(config: Config, project_code: str) -> tuple[dict | None, float | None]:
    """Read the LFMerge state file. Returns (parsed, mtime), either may be None."""
    path = config.state_file(project_code)
    try:
        mtime = os.path.getmtime(path)
        with open(path, encoding="utf-8") as handle:
            raw = handle.read()
    except (FileNotFoundError, NotADirectoryError):
        return None, None
    try:
        return json.loads(raw), mtime
    except json.JSONDecodeError:
        # LFMerge may be part-way through writing it; treat as "not readable yet".
        return None, mtime


def clear_send_receive_state(config: Config, project_code: str, suffix: str) -> list[str]:
    """Remove any webwork clone and LFMerge state file left over from an earlier attempt.

    A LexBox project gets a fresh root changeset every time it is created: initFwDataProject
    builds a template .fwdata and commits it, and that commit's hash depends on when it was
    made, so creating the same project code twice produces two repositories with no ancestor
    in common. A clone taken before the project was recreated is therefore unrelated to it
    permanently, and the first Send/Receive fails inside Chorus with

        abort: repository is unrelated

    Nothing else clears it. LFMerge's EnsureCloneAction skips its initial clone whenever the
    state file and the .fwdata both exist, so a stale clone is used rather than replaced, and
    this script has just created the LexBox project the clone would have to match.

    Only ever called for the copy's code, which this script generates by appending the suffix,
    so anything found under it is a leftover from a previous run of this same migration and
    never a project a user has data in. The suffix is checked again here because this deletes
    a repository.

    Returns the paths removed, for the caller to report.
    """
    if not suffix or not project_code.endswith(suffix):
        raise Fatal(
            f"refusing to clear Send/Receive state for '{project_code}': it does not end with "
            f"'{suffix}', so it is not a project code this script generated"
        )

    removed = []
    webwork = config.webwork_path(project_code)
    if os.path.isdir(webwork):
        shutil.rmtree(webwork)
        removed.append(webwork)

    state_file = config.state_file(project_code)
    if os.path.exists(state_file):
        os.unlink(state_file)
        removed.append(state_file)

    return removed


def trigger_send_receive(config: Config, project_code: str) -> str:
    """Queue the project for Send/Receive by dropping a file in the syncqueue.

    LFMerge's lfmergeqm-looping.sh waits on `inotifywait -e close_write` over
    the syncqueue directory, so this fires within milliseconds. The FILENAME is
    the project code -- that is what LfMerge's Queue.cs reads; the contents are
    ignored, but we write the same line PHP writes
    (SendReceiveCommands::queueProjectForSync) for consistency.
    """
    queue_dir = config.syncqueue_path
    if not os.path.isdir(queue_dir):
        os.makedirs(queue_dir, mode=0o2775, exist_ok=True)

    queue_file = config.queue_file(project_code)
    with open(queue_file, "w", encoding="utf-8") as handle:
        handle.write(f"projectCode: {project_code}")
    try:
        os.chmod(queue_file, 0o664)
    except PermissionError:
        pass
    chown_to_web_user(queue_file, recursive=False)
    return queue_file


def wait_for_send_receive(config: Config, project_code: str, *, timeout: int, label: str) -> None:
    """Block until LFMerge has finished the queued Send/Receive.

    Two phases, because a stale state file from a previous run would otherwise
    look like instant success:

      1. Pickup -- wait until lfmergeqm has dequeued our file (LfMerge's
         Queue.cs deletes it when it starts) AND either the state file has been
         rewritten since we queued, or it reports an in-progress state.
      2. Completion -- wait for SRState to reach IDLE/SYNCED, or fail on
         HOLD/ERROR.
    """
    queue_file = config.queue_file(project_code)
    _, state_mtime_at_trigger = read_sr_state(config, project_code)
    started = time.monotonic()
    picked_up = False
    last_reported: str | None = None

    stale, _ = read_sr_state(config, project_code)
    stale_state = (stale or {}).get("SRState")
    if stale_state in SR_FAILED:
        log(f"  [{label}] note: previous run left SRState={stale_state}; waiting for a fresh result")

    while True:
        elapsed = time.monotonic() - started
        queued = os.path.exists(queue_file)
        state, mtime = read_sr_state(config, project_code)
        srstate = (state or {}).get("SRState")

        if srstate and srstate != last_reported:
            log(f"  [{label}] SRState={srstate}")
            last_reported = srstate

        if not picked_up and not queued:
            state_is_fresh = mtime is not None and (
                state_mtime_at_trigger is None or mtime > state_mtime_at_trigger
            )
            if srstate in SR_IN_PROGRESS or state_is_fresh:
                picked_up = True

        # Both the failure and the success check are gated on pickup, because a
        # leftover state file from a previous run would otherwise be read as an
        # instant verdict on this one -- an old ERROR would abort a legitimate
        # retry, and an old IDLE would declare success before LFMerge started.
        if picked_up and srstate in SR_FAILED:
            raise Fatal(
                f"Send/Receive ({label}) reported SRState={srstate}. "
                f"See {config.state_file(project_code)} and `docker compose logs lfmerge`."
            )

        if picked_up and srstate in SR_DONE:
            log(f"  [{label}] finished after {elapsed:.0f}s (SRState={srstate})")
            return

        if not picked_up and elapsed > PICKUP_TIMEOUT_SECONDS:
            raise Fatal(
                f"LFMerge did not pick up the Send/Receive request within "
                f"{PICKUP_TIMEOUT_SECONDS}s (queue file {queue_file} "
                f"{'still present' if queued else 'was consumed but no state was written'}). "
                "Is the lfmerge container running?"
            )

        if elapsed > timeout:
            raise Fatal(
                f"Send/Receive ({label}) did not finish within {timeout}s "
                f"(last SRState={srstate}). It may still be running; check "
                "`docker compose logs lfmerge` before retrying."
            )

        time.sleep(POLL_INTERVAL_SECONDS)


def send_receive(config: Config, project_code: str, *, timeout: int, label: str) -> None:
    queue_file = trigger_send_receive(config, project_code)
    log(f"  queued {queue_file}")
    wait_for_send_receive(config, project_code, timeout=timeout, label=label)


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Migrate a non-Send/Receive Language Forge project into Send/Receive.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("project_code", metavar="projectCode", help="projectCode of the project to copy")
    parser.add_argument(
        "--suffix",
        default=MIGRATE_SUFFIX,
        help=f"suffix for the new projectCode (default: {MIGRATE_SUFFIX})",
    )
    parser.add_argument(
        "--project-name",
        default=None,
        help="projectName for the copy (default: original name with the suffix appended)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="overwrite an existing copy instead of refusing to run",
    )
    parser.add_argument(
        "--no-assets",
        action="store_true",
        help="do not copy audio/pictures, and skip the second Send/Receive",
    )
    parser.add_argument(
        "--no-send-receive",
        action="store_true",
        help="stop after init_lexbox_project; do not run either Send/Receive",
    )
    parser.add_argument(
        "--sr-timeout",
        type=int,
        default=DEFAULT_SR_TIMEOUT_SECONDS,
        metavar="SECONDS",
        help=f"how long to wait for each Send/Receive (default: {DEFAULT_SR_TIMEOUT_SECONDS})",
    )

    lexbox = parser.add_argument_group("LexBox")
    lexbox.add_argument(
        "--lexbox-host",
        default=DEFAULT_LEXBOX_HOST,
        metavar="HOST",
        help=(
            f"LexBox host (default: {DEFAULT_LEXBOX_HOST}, which is where a development "
            "LexBox lives -- it runs outside this Compose environment and is reached via "
            "the admin.localhost extra_hosts entry. Production: lexbox.org). HTTPS is used "
            "unless a scheme is given; self-signed certificates are accepted only for "
            "localhost and .localhost subdomains."
        ),
    )
    lexbox.add_argument(
        "--lexbox-user",
        default=DEFAULT_LEXBOX_USER,
        metavar="USER",
        help=f"LexBox username (default: {DEFAULT_LEXBOX_USER}); must be a LexBox admin",
    )
    lexbox.add_argument(
        "--lexbox-password",
        default=None,
        metavar="PASSWORD",
        help=(
            f"LexBox password (default: the LEXBOX_PASSWORD environment variable, "
            f"or {DEFAULT_LEXBOX_PASSWORD!r})"
        ),
    )
    lexbox.add_argument(
        "--lexbox-auth",
        choices=("cookie", "jwt-query", "bearer"),
        default="cookie",
        help=(
            "how to present the login JWT on API calls. 'cookie' replays the .LexBoxAuth "
            "cookie (default, always works); 'jwt-query' sends ?jwt=<token>; 'bearer' sends "
            "an Authorization: Bearer header, which LexBox routes to OpenIddict and rejects "
            "whenever OpenId is enabled -- as it is in Development"
        ),
    )
    lexbox.add_argument(
        "--lexbox-timeout",
        type=int,
        default=DEFAULT_LEXBOX_TIMEOUT_SECONDS,
        metavar="SECONDS",
        help=f"timeout for LexBox calls (default: {DEFAULT_LEXBOX_TIMEOUT_SECONDS})",
    )
    lexbox.add_argument(
        "--ws-vernacular",
        action="append",
        default=None,
        metavar="TAG",
        help="override the vernacular writing systems (repeat for several, in order)",
    )
    lexbox.add_argument(
        "--ws-analysis",
        action="append",
        default=None,
        metavar="TAG",
        help="override the analysis writing systems (repeat for several, in order)",
    )
    parser.add_argument(
        "--no-init",
        action="store_true",
        help=(
            "skip the LexBox init and assume the project and its repository already exist, in a "
            "correct state. For recovering from a 504 Gateway Timeout on initFwDataProject, which "
            "sometimes creates the project anyway. Combines with --force, which only ever touches "
            "the Mongo side; under --resume the init is skipped regardless"
        ),
    )
    parser.add_argument(
        "--resume",
        action="store_true",
        help=(
            "finish a migration that stopped because the project has custom fields: skip the copy, "
            "the project record and the LexBox init, and run only the Send/Receive steps. Use this "
            "once the FLExProject.CustomProperties commit has been pushed to LexBox."
        ),
    )
    parser.add_argument(
        "--custom-fields-only",
        action="store_true",
        help=(
            "report the project's custom fields and stop, without copying anything. Use this to "
            "survey what a LexBox custom-field API would have to create for a project."
        ),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="validate and report the plan without changing anything",
    )
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    config = Config()

    source_code = args.project_code.strip()
    if not source_code:
        log("ERROR: projectCode must not be empty")
        return 2
    if source_code.endswith(args.suffix):
        log(f"ERROR: '{source_code}' already ends with '{args.suffix}'; refusing to copy a copy")
        return 2
    if args.resume and args.force:
        log("ERROR: --resume finishes an existing migration and --force restarts one; pick one")
        return 2
    if args.resume and args.no_init:
        # Not an error: --resume already skips the init, so --no-init asks for nothing extra.
        log("NOTE: --no-init is redundant with --resume, which skips the LexBox init anyway")

    new_code = source_code + args.suffix
    # The Send/Receive identifier -- and therefore the LexBox project code -- is
    # a normalised form of the projectCode, so the two are not interchangeable.
    # Everything LFMerge keys on locally (webwork, state, syncqueue, the project
    # database) still uses the projectCode.
    new_identifier = send_receive_identifier(new_code)
    source_db = database_name(source_code)
    target_db = database_name(new_code)

    log(f"Mongo:    {config.safe_uri()}")
    log(f"Main DB:  {config.database}")

    # ---- validate -------------------------------------------------------- #
    source = fetch_project(config, source_code)
    if source is None:
        log(f"ERROR: no project with projectCode '{source_code}' in {config.database}.projects")
        return 1

    app_name = source["appName"] or "lexicon"
    new_name = args.project_name if args.project_name is not None else f"{source['projectName']}{args.suffix}"

    log("")
    log(f"Source:   {source['projectCode']}  ({source['projectName']!r}, _id {source['id']})")
    log(f"          app={app_name} site={source['siteName']} members={source['memberCount']}")
    log(f"          database={source_db}")
    if source["isArchived"]:
        log("          NOTE: source project is archived")

    # This script exists to migrate projects INTO the Send/Receive system, so a
    # project that already has an identifier is out of scope: copying it would
    # produce a second project pointing at a repository that already has a
    # different LF project syncing with it.
    existing_identifier = (source["sendReceiveProjectIdentifier"] or "").strip()
    if existing_identifier:
        log("")
        log(f"ERROR: '{source_code}' is already a Send/Receive project.")
        log(f"       sendReceiveProjectIdentifier = {existing_identifier!r}")
        log("       This script only migrates projects that are not yet using Send/Receive.")
        return 1
    log("          sendReceive: none (eligible for migration)")

    # LexBox will reject the code outright, so check before copying anything.
    # Note LF project codes may contain uppercase, which LexBox does not allow.
    if len(new_identifier) < LEXBOX_CODE_MIN_LENGTH or not LEXBOX_CODE_RE.match(new_identifier):
        log("")
        log(f"ERROR: projectCode '{new_code}' normalises to '{new_identifier}',")
        log("       which is not a valid LexBox project code.")
        log(f"       LexBox requires at least {LEXBOX_CODE_MIN_LENGTH} characters matching")
        log(f"       {LEXBOX_CODE_RE.pattern} (lowercase letters, digits and hyphens only,")
        log("       not starting with a hyphen).")
        return 1

    writing_systems = fetch_writing_systems(config, source_code)
    # Read from the SOURCE, because this runs before anything is copied. Used to settle which list a
    # writing system declared in both should leave.
    anchor_counts = count_anchor_writing_system_usage(config, source_db)
    ws_vernacular, ws_analysis, ws_unclassified = classify_writing_systems(
        writing_systems, args.ws_vernacular, args.ws_analysis, anchor_counts
    )

    log("")
    log(f"Copy to:  {new_code}  ({new_name!r})")
    log(f"          database={target_db}")
    log(f"          sendReceiveProjectIdentifier={new_identifier}", )
    if new_identifier != new_code:
        log(f"          (normalised from projectCode {new_code!r}; LexBox requires lowercase)")
    log(f"          LexBox project code={new_identifier}")
    log(f"          webwork={config.webwork_path(new_code)}")
    log("")
    log("Writing systems (from the Language Forge project config):")
    log(f"          lexeme={writing_systems['lexeme']} citationForm={writing_systems['citationForm']}")
    log(f"          definition={writing_systems['definition']} gloss={writing_systems['gloss']}")
    log(f"          all config fields={writing_systems['config_all']}")
    log(f"          project.inputSystems={writing_systems['declared']}")
    if anchor_counts:
        summary = ", ".join(
            f"{tag}={counts.get('vernacular', 0)}v/{counts.get('analysis', 0)}a"
            for tag, counts in sorted(anchor_counts.items())
        )
        log(f"          entries with data (vernacular/analysis fields): {summary}")

    if ws_unclassified:
        log("")
        log("WARNING: these writing systems are in the project but are neither vernacular")
        log(f"         nor analysis by the field conventions: {', '.join(ws_unclassified)}")
        log("         Treating them as ANALYSIS writing systems so that they still reach the")
        log("         FieldWorks project. Check the result, and pass --ws-vernacular /")
        log("         --ws-analysis if any of them belong somewhere else.")
        log("")

    source_note = " (from --ws-vernacular)" if args.ws_vernacular else ""
    log(f"  wsVernacular: {ws_vernacular}{source_note}")
    notes = []
    if args.ws_analysis:
        notes.append("from --ws-analysis")
    if ws_unclassified:
        notes.append(f"includes {len(ws_unclassified)} unclassified")
    source_note = f" ({', '.join(notes)})" if notes else ""
    log(f"  wsAnalysis:   {ws_analysis}{source_note}")
    if not ws_vernacular:
        log("")
        log("ERROR: LexBox requires at least one vernacular writing system, but this project's")
        log("       config.entry.fields.lexeme.inputSystems is empty. Pass --ws-vernacular.")
        return 1
    log("")

    # Custom fields are read from the SOURCE project: this runs before anything is copied, so the
    # target database does not exist yet. Report only -- LfMerge cannot create custom fields in
    # FieldWorks ("Custom field X from LF skipped, because we're not yet creating new custom fields
    # in LCM"), so anything listed here will not survive the migration until something does.
    custom_fields = describe_custom_fields(
        fetch_custom_fields(config, source_code),
        scan_custom_field_usage(config, source_db),
    )
    report_custom_fields(custom_fields)
    log("")

    # Two custom fields whose names differ only by case have to be separated before FieldWorks sees
    # them. Checked here, before anything has been copied, so an unhandled clash costs nothing.
    custom_field_renames, rename_problems = plan_custom_field_renames(custom_fields)
    if custom_field_renames or rename_problems:
        log("Custom field names differing only by case:")
        report_custom_field_renames(custom_field_renames, rename_problems)
        log("")
    if rename_problems:
        log("ERROR: refusing to migrate a project whose custom field names differ only by case")
        log("       without knowing which one should keep its name. FLEx is inconsistent about")
        log("       whether it treats such a pair as one field or two, so migrating them as they")
        log("       are risks conflating two fields that hold different data.")
        log(f"       Add the name to rename to CASE_CLASH_CUSTOM_FIELD_RENAMES in "
            f"{os.path.basename(sys.argv[0])}, having first checked which of the two should")
        log("       keep its name and whether they hold the same kind of data.")
        return 1
    # Everything downstream -- the FieldWorks definitions, and so the XML -- has to describe the
    # fields under the names the copy will actually use.
    apply_custom_field_renames(custom_fields, custom_field_renames)

    # LfMerge skips any LF custom field that does not already exist in FieldWorks, and the first
    # Send/Receive is the only pass that would have carried the data. So a project with custom
    # fields stops before Send/Receive and prints the definitions for a human to commit; --resume
    # picks it up again afterwards.
    custom_field_defs, custom_fields_dropped = plan_custom_field_definitions(
        custom_fields, ws_vernacular, ws_analysis
    )
    stop_for_custom_fields = bool(custom_field_defs) and not args.resume

    if args.custom_fields_only:
        # Show the definitions this project would need, but write nothing: this flag exists to
        # survey a project without touching it, and a file on disk is a change to something.
        if custom_field_defs:
            report_custom_field_definitions(custom_field_defs, custom_fields_dropped)
            log_custom_properties_xml(build_custom_properties_xml(custom_field_defs))
        log("")
        log("--custom-fields-only: stopping here, nothing was changed and no file was written.")
        return 0

    existing = fetch_project(config, new_code)
    target_collections = count_collections(config, target_db)
    if args.resume:
        # --resume continues a run that stopped for custom fields, so the copy it is resuming has
        # to still be there. Recreating it here would give the project a new LexBox repository and
        # throw away the custom field commit that --resume exists to wait for.
        if existing is None:
            log(f"ERROR: --resume: there is no project '{new_code}' to resume.")
            log("       Run without --resume first; that is what creates the copy.")
            return 1
        if target_collections == 0:
            log(f"ERROR: --resume: database '{target_db}' is empty, so the copy is not there to resume.")
            return 1
        log(f"--resume: continuing the existing copy '{new_code}' (_id {existing['id']})")
        log("")
    else:
        if existing is not None and not args.force:
            log(f"ERROR: project '{new_code}' already exists (_id {existing['id']}). Use --force to overwrite.")
            return 1
        if target_collections > 0 and not args.force:
            log(f"ERROR: database '{target_db}' already has {target_collections} collection(s). Use --force to overwrite.")
            return 1

    special = SPECIAL_LEXICON_INT_REFERENCES.get(source_code)
    if special:
        special_field, special_values = special
        log(f"Special case: {source_code!r} has a lexicon reference to an option list item")
        log(f"          by number ({special_field}.values == {special_values}). That sense will be")
        log("          coerced to strings along with the option list keys.")
        log("")

    if args.dry_run:
        log("Planned sequence:")
        log("  0. (already done above) report the source project's custom fields")
        if args.resume:
            log("     --resume: steps 1-6 are SKIPPED; the existing copy is picked up at step 7")
        log(f"  1. copy database {source_db} -> {target_db}")
        log(f"  2. coerce numeric option list keys in {target_db} to strings"
            + (", and the special-case lexicon sense" if special else ""))
        empty_guid_count = len(find_empty_entry_guids(config, source_db))
        log(f"  3. replace empty entry guids with fresh UUID4s"
            f" ({empty_guid_count} found in {source_db})")
        if custom_field_renames:
            log(f"  3b. rename {len(custom_field_renames)} custom field(s) in {target_db}.lexicon"
                " and in the copied config:")
            for rename in custom_field_renames:
                log(f"      {rename['level']:8s} {rename['old_key']} -> {rename['new_key']}")
        log("  4. stage assets" + (" (SKIPPED: --no-assets)" if args.no_assets else ""))
        log("  5. create project record")
        if args.no_init:
            log(f"  6. SKIPPED: --no-init; assuming LexBox project {new_identifier!r} already exists")
        else:
            log(f"  6. init_lexbox_project: log in to {split_lexbox_host(args.lexbox_host)[0]}://"
                f"{split_lexbox_host(args.lexbox_host)[1]} as {args.lexbox_user!r},")
            log("     POST /api/project/initFwDataProject")
        if args.no_send_receive:
            log("  7-9. SKIPPED: --no-send-receive")
        elif stop_for_custom_fields:
            log(f"  7-9. SKIPPED: {len(custom_field_defs)} custom field(s) found. The run will stop after")
            log(f"     step 6 and write {CUSTOM_PROPERTIES_FILENAME} for a human to commit to the")
            log("     project's Mercurial repository, then be resumed with --resume.")
        else:
            log(f"  7. clear any stale webwork clone and state file for {new_code},")
            log("     then Send/Receive #1 (push Mongo data), wait for completion")
            if args.no_assets:
                log("  8-9. SKIPPED: --no-assets")
            else:
                log("  8. move assets into webwork LinkedFiles, symlink back")
                log("  9. Send/Receive #2 (push assets), wait for completion")
        log("")
        log("--dry-run: stopping here, nothing was changed.")
        return 0

    # ---- copy ------------------------------------------------------------ #
    # Undo actions, applied in reverse order if a later step fails. Cleared once
    # the first Send/Receive starts, since by then data has left for LexBox and
    # LFMerge owns the webwork tree.
    undo: list[tuple[str, Callable[[], None]]] = []
    new_id = None
    lexbox_guid = None
    coercion: dict | None = None
    lexicon_coercion: dict | None = None
    guid_fix: dict | None = None
    rename_result: dict | None = None

    try:
        if args.resume:
            # Everything below was done by the run that stopped for custom fields. Redoing any
            # of it would replace the LexBox project, and with it the repository holding the
            # custom field commit that --resume exists to wait for.
            new_id = existing["id"]
            log("--resume: skipping the copy, the project record and the LexBox init")
        else:
            if args.force and existing is not None:
                log(f"--force: removing existing project '{new_code}' (_id {existing['id']})")
                delete_project_record(config, existing["id"])

            log(f"Copying database {source_db} -> {target_db}")
            copy_project_database(config, source_db, target_db, drop=args.force)
            undo.append(
                (
                    f"drop database {target_db}",
                    lambda: mongosh_json(
                        config,
                        f"db.getSiblingDB({json.dumps(target_db)}).dropDatabase();\nprint(JSON.stringify({{ok:1}}));\n",
                        what=f"Dropping {target_db}",
                    ),
                )
            )

            # Before anything else looks at the copy: option list keys are meant to
            # be strings, and the lexicon already references them that way. Runs
            # inside the same try, so a failure here rolls the copy back.
            log(f"Coercing numeric option list keys in {target_db}")
            coercion = coerce_option_list_keys(config, target_db)
            lexicon_coercion = coerce_special_lexicon_references(config, target_db, source_code)

            # Also before the first Send/Receive: an entry with an empty guid would
            # be pushed to FieldWorks under the all-zeros GUID.
            log(f"Replacing empty entry guids in {target_db}")
            guid_fix = fix_empty_entry_guids(config, target_db)

            if custom_field_renames:
                log(f"Renaming custom fields in {target_db}")
                rename_result = rename_custom_fields_in_lexicon(
                    config, target_db, custom_field_renames
                )

            if args.no_assets:
                log("Skipping assets (--no-assets)")
            else:
                log("Staging assets")
                staged = stage_assets(config, app_name, source_db, target_db)
                if staged:
                    undo.append(
                        (
                            f"remove assets {staged}",
                            lambda path=staged: shutil.rmtree(path, ignore_errors=True),
                        )
                    )

            log("Creating project record")
            new_id = create_project_record(
                config, source_code, new_code, new_name, new_identifier, custom_field_renames
            )
            undo.append(
                (f"remove project record {new_id}", lambda pid=new_id: delete_project_record(config, pid))
            )

            if args.no_init:
                # Nothing here is rolled back on failure -- init_lexbox_project has no undo entry,
                # which is exactly how a 504 leaves a LexBox project behind while everything on the
                # Language Forge side is undone. Re-creating it would fail on the existing code, so
                # this trusts the project that is already there.
                log(f"Skipping LexBox init (--no-init): assuming project {new_identifier!r} and its")
                log(f"  repository already exist at {args.lexbox_host}, with the right writing systems.")
                log(f"  Expected wsVernacular: {', '.join(ws_vernacular)}")
                log(f"  Expected wsAnalysis:   {', '.join(ws_analysis) or '(none)'}")
            else:
                log("Initializing LexBox project")
                lexbox_client = LexboxClient(
                    args.lexbox_host,
                    args.lexbox_user,
                    args.lexbox_password
                    if args.lexbox_password is not None
                    else os.environ.get("LEXBOX_PASSWORD", DEFAULT_LEXBOX_PASSWORD),
                    auth_mode=args.lexbox_auth,
                    timeout=args.lexbox_timeout,
                )
                lexbox_guid = init_lexbox_project(
                    lexbox_client,
                    new_identifier,
                    new_name,
                    ws_vernacular,
                    ws_analysis,
                )

        if stop_for_custom_fields:
            # Deliberately before any Send/Receive: LfMerge would skip every one of these fields
            # and the data in them, and the first Send/Receive is the only pass that would have
            # carried it. The definitions have to reach the repository first.
            custom_properties_path = emit_custom_properties(
                custom_field_defs, custom_fields_dropped, new_code, new_identifier, args.lexbox_host
            )
            log("")
            log("Send/Receive NOT run, and no data has been pushed to LexBox yet.")
            log(f"Once {custom_properties_path} has been committed and pushed, finish with:")
            log(f"    {os.path.basename(sys.argv[0])} {source_code} --suffix {args.suffix} --resume")
        elif args.no_send_receive:
            log("Skipping both Send/Receive runs (--no-send-receive)")
            log("  NOTE: assets are still real directories; they will not be linked into")
            log("        webwork until a Send/Receive has created it.")
        else:
            # A newly created LexBox project has a root changeset no earlier clone can share, so
            # any clone a previous attempt left behind has to go, or LFMerge would reuse it and
            # Chorus would abort the pull as unrelated. Done under --no-init as well: the clone is
            # then of the same repository and would not be rejected, but a clone left by an attempt
            # that failed partway is not worth trusting either.
            stale = clear_send_receive_state(config, new_code, args.suffix)
            for path in stale:
                log(f"Removed stale Send/Receive state from an earlier attempt: {path}")

            # Past this point a failure is not safely reversible: LFMerge has
            # started pushing to LexBox and owns the webwork clone.
            undo.clear()

            log("Send/Receive #1: pushing Mongo data to LexBox")
            send_receive(config, new_code, timeout=args.sr_timeout, label="1/2")

            if args.no_assets:
                log("Skipping asset linking and Send/Receive #2 (--no-assets)")
            else:
                log("Moving assets into the Send/Receive work tree")
                link_assets_into_webwork(config, app_name, target_db, new_code)

                log("Send/Receive #2: pushing assets to LexBox")
                send_receive(config, new_code, timeout=args.sr_timeout, label="2/2")

    except Fatal as exc:
        log("")
        log(f"ERROR: {exc}")
        if undo:
            log("Rolling back:")
            for description, action in reversed(undo):
                log(f"  {description}")
                try:
                    action()
                except Exception as cleanup_exc:  # noqa: BLE001 - best effort
                    log(f"    rollback step failed: {cleanup_exc}")
        elif new_id is not None:
            log("NOT rolling back: Send/Receive has already run, so the copy and its")
            log(f"LexBox project may hold real data. Inspect '{new_code}' before retrying.")
        return 1

    # ---- report ---------------------------------------------------------- #
    log("")
    if stop_for_custom_fields:
        log(f"Paused for custom fields; not finished. '{source_code}' was left untouched.")
    else:
        log(f"Done. '{source_code}' was left untouched.")
    log(f"  new project:  {new_code}  (_id {new_id})")
    log(f"  new database: {target_db}")
    if coercion:
        log(f"  option list keys coerced to strings: {coercion['keysCoerced']}"
            f" (in {coercion['listsChanged']} list(s))")
    if lexicon_coercion and lexicon_coercion["valuesCoerced"]:
        log(f"  lexicon values coerced to strings:   {lexicon_coercion['valuesCoerced']}"
            f" (in {lexicon_coercion['entriesChanged']} entry/entries)")
    if guid_fix and guid_fix["fixed"]:
        log(f"  empty entry guids replaced:          {guid_fix['fixed']}")
    if rename_result and rename_result["keysRenamed"]:
        log(f"  custom field keys renamed:           {rename_result['keysRenamed']}"
            f" (in {rename_result['entriesChanged']} entry/entries)")
        for rename in custom_field_renames:
            log(f"    {rename['old_name']!r} -> {rename['new_name']!r}")
    if new_identifier != new_code:
        log(f"  S/R identifier: {new_identifier}")
    if lexbox_guid:
        log(f"  LexBox GUID:  {lexbox_guid}")
    elif args.no_init and not args.resume:
        log(f"  LexBox:       init skipped (--no-init); used the existing {new_identifier!r}")
    if not args.no_send_receive and not stop_for_custom_fields:
        log(f"  state file:   {config.state_file(new_code)}")
        if not args.no_assets:
            log(f"  assets now symlink into {config.linked_files_path(new_code)}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except Fatal as exc:
        log(f"ERROR: {exc}")
        sys.exit(1)
    except KeyboardInterrupt:
        log("Interrupted.")
        sys.exit(130)
