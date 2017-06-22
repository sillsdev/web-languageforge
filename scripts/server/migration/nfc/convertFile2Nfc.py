#!/usr/bin/python3

import sys, os
import unicodedata

if len(sys.argv) < 2:
    errormsg = "Usage: %s [filename]" % sys.argv[0]
    raise Exception(errormsg)

inputfilename = sys.argv[1]
outputfilename = inputfilename + ".tonfc"
if os.path.isfile(inputfilename):
    with open(inputfilename, encoding="utf-8") as inputfile:
        with open(outputfilename, encoding="utf-8", mode='w') as outputfile:
            ctr = 0
            for line in inputfile:
                line_normalized = unicodedata.normalize('NFC', line)
                if line != line_normalized: ctr += 1
                outputfile.write(line_normalized)
            if ctr > 0:
                print("Converted %s with %d difference(s)" % (inputfilename, ctr))
else:
    raise Exception("input is not a file")
	
os.rename(outputfilename, inputfilename)