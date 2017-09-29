#!/usr/bin/python3

import sys, os
import unicodedata

if len(sys.argv) < 2:
    errormsg = "Usage: %s [directory]" % sys.argv[0]
    raise Exception(errormsg)

for root, dirs, files in os.walk(sys.argv[1]):
    for file in files:
        inputfilename = os.path.join(root, file)
        print("Converting %s to NFC" % inputfilename)
        outputfilename = inputfilename + ".bak"
        if os.path.isfile(inputfilename):
            with open(inputfilename, encoding="utf-8") as inputfile:
                with open(outputfilename, encoding="utf-8", mode='w') as outputfile:
                    for line in inputfile:
                        outputfile.write(unicodedata.normalize('NFC', line))
            os.rename(outputfilename, inputfilename)
	
#for line in fileinput.input(inplace=True, backup=".bak", openhook=fileinput.hook_encoded("utf-8")):
#    print(unicodedata.normalize('NFC', line))