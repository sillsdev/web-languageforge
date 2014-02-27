#!/usr/bin/env python

"""Parses language data from IANA subtag registry plus several other files,
and outputs JSON data in the following format:
{
    'aaa': {
        'name': 'Ghotuo',
        'code': { 3: 'aaa' },
        'country': ['Nigeria'],
        'other names': [],
    },
    'aab': {
        'name': 'Alumu',
        'code': { 3: 'aab' },
        'country': ['Nigeria'],
        'other names': ['Alumu', 'Tesu', 'Arum', 'Alumu-Tesu', 'Alumu', 'Arum-Cesu', 'Arum-Chessu', 'Arum-Tesu'],
    },
    # ...
    'auc': {
        'name': 'Waorani',
        'code': { 3: 'auc' },
        'country': ['Brazil'],
        'other names': ['Huaorani', 'Sabela', 'Waodani', 'Auca (pejorative)'],
    }
    # ...
    'en': {
        'name': 'English',
        'code': { 2: 'en', 3: 'eng' },
        'country': ['Australia', 'United Kingdom', 'United States', ...],
        'other names': ['Belfast (dialect)', 'Birmingham (dialect)', ...],
    }
    # ...
}"""

import os, sys
import re
from pprint import pprint, pformat
import codecs
import collections
import json

# Constants - mostly hardcoded filenames
SUBTAG_REGISTRY_FNAME = "ianaSubtagRegistry.txt"
COUNTRY_CODES_FNAME   = "CountryCodes.txt"
LANGUAGE_CODES_FNAME  = "LanguageCodes.txt"
LANGUAGE_INDEX_FNAME  = "LanguageIndex.txt"
CONVERT_2_TO_3_FNAME  = "TwoToThreeCodes.txt"
OUTPUT_FNAME = "languages.json"

def read_file(fname):
    with codecs.open(fname, 'rU', 'utf-8-sig') as f:
        result = f.read()  # utf-8-sig means strip BOM from start of file, if present
    return result

def read_all_files():
    try:
        data = {
            "subtags": read_file(SUBTAG_REGISTRY_FNAME),
            "ccs":  read_file(COUNTRY_CODES_FNAME),
            "lcs":  read_file(LANGUAGE_CODES_FNAME),
            "lndx": read_file(LANGUAGE_INDEX_FNAME),
            "2to3": read_file(CONVERT_2_TO_3_FNAME),
        }
    except IOError:
        return None
    else:
        return data

def parse_subtag_registry(raw_text):
    """Returns data as a dict of lists, keyed by record type:
        result['language'] = (list of language records)
        result['extlang'] = (list of extended language records)
        result['script'] = (list of script records)
    And so on. Valid keys for result dict will be language, extlang, script,
    region, variant, grandfathered, redundant."""
    result = collections.defaultdict(list)
    records = raw_text.split(u"%%\n")
    for record in records:
        data = {}
        if record.startswith(u"File-Date:"):
            continue  # First "record" of file is only file-date
        record = record.replace(u"\n  ", u" ")  # Line continuations: newline plus two spaces
        record = re.sub(u" +", u" ", record)    # Multiple spaces are collapsed into one, per spec
        for line in record.splitlines():
            key, val = line.split(": ", 1)
            data[key] = val
        result[data[u'Type']].append(data)
    return result

def parse_tab_separated_file(raw_text, first_line_contains_field_names=True):
    """Returns data as either:
        - a list of dicts, if first_line_contains_field_names is True
        - a list of lists, if first_line_contains_field_names is False
    """
    result = []
    lines = raw_text.splitlines()
    if first_line_contains_field_names:
        field_names = lines[0].split('\t')
        lines = lines[1:]
    for line in lines:
        fields = [field.strip() for field in line.split('\t') if line.strip()]
        if first_line_contains_field_names:
            result.append(dict(zip(field_names, fields)))
        else:
            result.append(fields)
    return result

def parse_all_files(data):
    result = {}
    result['subtags'] = parse_subtag_registry(data['subtags'])
    result['ccs']  = parse_tab_separated_file(data['ccs'], True)
    result['lcs']  = parse_tab_separated_file(data['lcs'], True)
    result['lndx'] = parse_tab_separated_file(data['lndx'], True)
    result['2to3'] = parse_tab_separated_file(data['2to3'], False)
    # Build lookup tables
    result['2to3_lookup'] = {record[0]: record[1] for record in result['2to3']}
    result['3to2_lookup'] = {record[1]: record[0] for record in result['2to3']}
    result['country_lookup'] = {record['CountryID']: record['Name'] for record in result['ccs']}
    return result

def build_final_result(data):
    result = collections.OrderedDict()
    for language_record in data['lndx']:
        langid3 = language_record[u'LangID']
        langid = data['3to2_lookup'].get(langid3, langid3)  # 2-letter code preferred, 3-letter code is fallback

        record = result.get(langid, {})

        if not record.has_key('code'):
            record['code'] = {}
            if len(langid) == 2:
                record['code'][2] = langid
            record['code'][3] = langid3

        country = data['country_lookup'].get(language_record[u'CountryID'])
        if country:
            record.setdefault('country', set()).add(country)

        name = language_record['Name']
        if language_record['NameType'] == 'L':
            record['name'] = name
        else:
            record.setdefault('other names', set()).add(name)

        if not result.has_key(langid):
            result[langid] = record
    return result

def write_json(final_result, out_fname):
    for record in final_result.itervalues():
        for key in ['country', 'other names']:
            if record.has_key(key):
                record[key] = list(sorted(record[key]))
    with codecs.open(out_fname, 'wU', 'utf-8') as f:
        json.dump(final_result, f, ensure_ascii=False, indent=4, separators=(',', ': '))

def main():
    sys.stderr.write('Reading files...\n')
    data = read_all_files()
    if not data:
        sys.stderr.write("Error reading input data files\n")
        sys.exit(2)
    sys.stderr.write('Parsing files...\n')
    data = parse_all_files(data)
    sys.stderr.write('Preparing JSON output...\n')
    result = build_final_result(data)
    write_json(result, OUTPUT_FNAME)

if __name__ == '__main__':
    main()
