import sys
import os
input = open(sys.argv[1], "r+")
content = input.readlines()

dirname = os.path.dirname(input.name)
outputPath = dirname + "/semdom-google-translate-en.txt"
output=open(outputPath, 'w+')


lines = {}
for line in content:
	if line not in lines:
		lines[line] = 1
		output.write(line)
