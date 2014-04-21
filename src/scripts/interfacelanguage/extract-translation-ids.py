#!/usr/bin/env python

import os, sys
import codecs
import argparse
import re
import unicodedata

html_attr_re1 = ur'translate="([^"]*)"'
html_attr_re2 = ur"translate='([^']*)'"
html_attr_re = re.compile(ur'{0}|{1}'.format(html_attr_re1, html_attr_re2))

angular_expr_re = re.compile(ur'{{(.*?)}}')
bar_translate_re = re.compile(ur'\|\s*translate')

def parse_html_file(args, fname):
    with codecs.open(fname, 'rU', 'utf-8') as f:
        for line in f:
            for m in html_attr_re.finditer(line):
                yield m.group(1)
            for m in angular_expr_re.finditer(line):
                for m2 in bar_translate_re.finditer(m.group(1)):
                    before_bar = eval(m2.string[:m2.start(0)].strip())
                    # If there turn out to be HTML escapes like &quot; in
                    # the string, we could do:
                    # import HTMLParser
                    # p = HTMLParser.HTMLParser()
                    # before_bar = p.unescape(before_bar)
                    yield before_bar

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

def parse_js_file(args, fname):
    with codecs.open(fname, 'rU', 'utf-8') as f:
        for line in f:
            for m in js_comment_re.finditer(line):
                yield eval(m.group(1).strip())
            for m in js_filter_re.finditer(line):
                rest = m.string[m.end(0):]
                quote_m = paren_quote_re.search(rest)
                close_quote = find_close_quote(quote_m)
                yield close_quote.string[:close_quote.start(0)]

def find_git_root(curdir=None):
    if curdir is None:
        curdir = os.getcwd()
    curdir = os.path.abspath(curdir)
    while not os.path.isdir(os.path.join(curdir, '.git')):
        curdir = os.path.normpath(os.path.join(curdir, os.pardir))
        # Sanity check: don't cross mount points (stop at / or C:\)
        if os.path.ismount(curdir):
            break
    return curdir

def walk_tree(args, root):
    for path, dirs, files in os.walk(root):
        # Don't descend into .git directory
        try:
            dirs.remove('.git')
        except ValueError:
            pass
        msgids = set()
        for name in files:
            absname = os.path.join(path, name)
            if absname.endswith('.html'):
                for msgid in parse_html_file(args, absname):
                    msgids.add(msgid)
            elif absname.endswith('.js'):
                for msgid in parse_js_file(args, absname):
                    msgids.add(msgid)
        if msgids:
            try:
                os.mkdir(os.path.join(path, 'lang'))
            except OSError:
                pass
            app_pot = codecs.open(os.path.join(path, 'lang', 'app.pot'), 'w', 'utf-8')
            en_po = codecs.open(os.path.join(path, 'lang', 'en.po'), 'w', 'utf-8')
        def sorthelper(x):
            # For use as a key function in sorted(). Sorts by alphanumeric
            # values only, stripping all non-alphanum values from string.
            if type(x) is bytes:
                x = x.decode('utf-8')
            x = unicodedata.normalize('NFKD', x).lower()
            # unicodedata.category() returns Lx for letters, Nx for numbers
            f = lambda c: unicodedata.category(c)[0] in ('L', 'N')
            return filter(f, x)
        for msgid in sorted(msgids, key=sorthelper):
            app_pot.write("msgid ")
            app_pot.write(repr(msgid.encode('utf-8')))
            app_pot.write('\n')
            app_pot.write('msgstr ""\n')
            app_pot.write('\n')  # And one more blank line
            en_po.write("msgid ")
            en_po.write(repr(msgid.encode('utf-8')))
            en_po.write('\n')
            en_po.write("msgstr ")
            en_po.write(repr(msgid.encode('utf-8')))
            en_po.write('\n')
            en_po.write('\n')  # And one more blank line
            print msgid  # For debugging

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('fname', nargs='?', help='Filename to process',
            default='examples/casestohandle.txt')
    parser.add_argument('--out-format', '-of', help="Output format (default POT)",
            default='pot')
    parser.add_argument('--lang', '-l', help="Language to make a PO file for",
            default='en')
    args = parser.parse_args()
    args.out_fname = 'app.{}'.format(args.out_format)
    args.lang_fname = '{}.{}'.format(args.lang, args.out_format[:-1])
    root = find_git_root()
    walk_tree(args, os.path.join(root, 'src', 'angular-app'))

if __name__ == '__main__':
    retcode = main()
    if retcode:
        sys.exit(retcode)
