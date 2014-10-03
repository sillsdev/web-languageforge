#!/usr/bin/env python

import os, sys
import fileinput

def main():
    msgid = ''
    msgpairs = []
    for line in fileinput.input():
        parts = line.lstrip().split(None, 1)
        if len(parts) < 2:
            continue
        msgtype = parts[0]  # Will be either 'msgid' or 'msgstr'
        text = parts[1]
        if msgtype == 'msgid':
            msgid = eval(text)
        elif msgtype == 'msgstr':
            msgpairs.append((msgid, eval(text)))
            msgid = ''
    lines = ['\t{}: {},'.format(repr(msgid), repr(msgstr)) for msgid, msgstr in msgpairs]
    lines[-1] = lines[-1][:-1] # Strip trailing comma from last line
    sys.stdout.write('{\n')
    sys.stdout.write('\n'.join(lines))
    sys.stdout.write('\n}\n')

if __name__ == '__main__':
    main()
