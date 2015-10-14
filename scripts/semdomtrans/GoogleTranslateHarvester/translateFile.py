import urllib2
import urllib
import sys
import os
import json
import os.path
import time
import atexit
from datetime import datetime

'''
Translates a list of words from English to target language
params:
* listOfWordsToTranlate - a list of strings representing words, phrases and sentences to translate
* to_language - target language of translation
* language - source language
'''
def translate(listOfWordsToTranslate, key, to_language="auto", language="en"):
	link = "https://www.googleapis.com/language/translate/v2?key=%s&source=%s&target=%s" % (key, language, to_language)
	link = link.encode('utf-8')
	if len(''.join(listOfWordsToTranslate)) < 2000:
		return _request(link, listOfWordsToTranslate)
	else:
		return _request(link, listOfWordsToTranslate[0:5]) + _request(link, listOfWordsToTranslate[5:10])
	
def _touchFile(fname):
    with open(fname, 'a'):
        os.utime(fname, None)
	
	
def _request(link, words):	
	for word in words:
		link = link + "&q=" + urllib.quote_plus(word)
	
	while True:
		try:
			request = urllib2.Request(link)
			result = urllib2.urlopen(request, '', 6).read()
			break
		except (urllib2.HTTPError) as error:
			e = json.loads(error.read())
			print e['error']['code'], e['error']['message']
			print link + "\n"
			if error.code == 403:
				print "sleeping 7 seconds..."
				time.sleep(7)
		except (urllib2.URLError) as error:
			print error
			time.sleep(3)
	
	return json.loads(result.decode('utf-8'))['data']['translations']

	
'''
Gets list of target languages for English language
'''	
def getTargetLanguages(key):
	link = "https://www.googleapis.com/language/translate/v2/languages?key=%s&target=en" % (key)  
	request = urllib2.Request(link)
	result = urllib2.urlopen(request).read()
	return json.loads(result)['data']['languages']
	
if __name__ == '__main__':
	languages = [langObj['language'] for langObj in getTargetLanguages(sys.argv[2]) if langObj['language'] != "en"]
	inputFile = open(sys.argv[1])
	
	#process in reverse if specified
	languagesIterator = languages
	if len(sys.argv) > 3:
		if sys.argv[3] == 'reverse':
			languagesIterator = reversed(languages)
	
	lines = [word.strip() for word in inputFile.readlines()]
	for language in languagesIterator:
		print "\nProcessing language %s (%d of %d)" % (language, languages.index(language) + 1, len(languages))
		skippedCtr = 0
		#dirname = os.path.dirname(inputFile.name)
		outputPath = "output/semdom-google-translate-" + language + ".txt"
		processedLines = []
		# check if there are previous translations, if so do not repeat translations for them 
		# by excluding them from list of items to be translated
		lockFile = outputPath + ".locked"
		#atexit.register(os.remove, lockFile)

		if os.path.isfile(lockFile):
			print "Skipping language %s because another harvester is working on it now" % language
			continue
		
		if os.path.isfile(outputPath):

			# skip over existing file if it was modified in the last 60 seconds (to prevent multiple harvester collisions)
			#if (datetime.now() - datetime.fromtimestamp(os.path.getmtime(outputPath))).total_seconds() < 60:
			#	print "Skipping language %s because the file was recently modified (other harvester in progress?" % language
			#	continue
			

		
			prevF = open(outputPath)
			prevTranslated = [line.strip() for line in prevF.readlines()]				
			prevF.close()
			prevTranslatedDict = {}
			for line in prevTranslated:
				source = line.split("|")[0]
				prevTranslatedDict[source] = 1
			processedLines = []
			for line in lines:
				if line not in prevTranslatedDict:
					processedLines.append(line)
				else:
					skippedCtr += 1
		else:
			processedLines = lines
		
		if (skippedCtr > 0):
			print "Found %d translations in an existing output file, so skipping those..." % skippedCtr
		
		f = open(outputPath,'a')
		print "There are %d translations left to process" % len(processedLines)
		# translate and print out using proper utf-8 encoding
		
		_touchFile(lockFile)
		for i in xrange(0, len(processedLines), 10):			
			tstart = datetime.now()
			translatedItems = translate(processedLines[i:i+10], sys.argv[2], language)
			for j in range(i, min(len(processedLines), i+10)):
				f.write(processedLines[j] + "|" + translatedItems[j%10]['translatedText'].encode('utf-8') + "\n")
			print "processed '%s' %d-%d of %d (%f seconds)" % (language, skippedCtr+i, skippedCtr+i+10, skippedCtr+len(processedLines), (datetime.now() - tstart).total_seconds())	
		os.remove(lockFile)

