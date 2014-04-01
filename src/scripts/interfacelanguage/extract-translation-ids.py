#!/usr/bin/env python

import os, sys
import codecs
import argparse
import re

html_attr_re1 = ur'translate="([^"]*)"'
html_attr_re2 = ur"translate='([^']*)'"
html_attr_re = re.compile(ur'{0}|{1}'.format(html_attr_re1, html_attr_re2))

angular_expr_re = re.compile(ur'{{(.*?)}}')
bar_translate_re = re.compile(ur'\|\s*translate')

def parse_html_file(fname):
    with codecs.open(fname, 'rU', 'utf-8') as f:
        for line in f:
            for m in html_attr_re.finditer(line):
                print m.group(1)
            for m in angular_expr_re.finditer(line):
                for m2 in bar_translate_re.finditer(m.group(1)):
                    before_bar = eval(m2.string[:m2.start(0)].strip())
                    # If there turn out to be HTML escapes like &quot; in
                    # the string, we could do:
                    # import HTMLParser
                    # p = HTMLParser.HTMLParser()
                    # before_bar = p.unescape(before_bar)
                    print before_bar

js_comment_re1 = ur'//\s*translate:(.*)'
js_comment_re2 = ur'/\*\s*translate:(.*?)(?:\s*\*/)?'
js_comment_re = re.compile(ur'{0}|{1}'.format(js_comment_re1, js_comment_re2))

def find_close_quote(mobj):
    # Given a match object representing the opening quote of a string (in group
    # 1 of the match object), find the first matching quote (" or ') not
    # immediately preceded by a backslash. This will fail on stings like "\\",
    # but that's okay -- we're not writing a general parser here.
    quote_char = mobj.group(1)
    close_quote_re = re.compile(ur'(?<!\\)' + quote_char)
    return close_quote_re.search(mobj.string[mobj.end(1):])

js_filter_re = re.compile(ur"""\$filter\(\s*["']translate["']\s*\)""")
paren_quote_re = re.compile(ur"""\s*\(\s*(["'])""")

def parse_js_file(fname):
    with codecs.open(fname, 'rU', 'utf-8') as f:
        for line in f:
            for m in js_comment_re.finditer(line):
                print eval(m.group(1).strip())
            for m in js_filter_re.finditer(line):
                rest = m.string[m.end(0):]
                quote_m = paren_quote_re.search(rest)
                close_quote = find_close_quote(quote_m)
                print close_quote.string[:close_quote.start(0)]

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('fname', nargs='?', help='Filename to process',
            default='examples/casestohandle.txt')
    args = parser.parse_args()
    parse_html_file(args.fname)
    parse_js_file(args.fname)

if __name__ == '__main__':
    retcode = main()
    if retcode:
        sys.exit(retcode)
