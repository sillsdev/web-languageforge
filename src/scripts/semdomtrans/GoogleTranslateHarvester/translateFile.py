import urllib2
import urllib
import sys
import os
import json
import os.path
import time
'''
Translates a list of words from English to target language
params:
* listOfWordsToTranlate - a list of strings representing words, phrases and sentences to translate
* to_language - target language of translation
* language - source language
'''
def translate(link, to_language="auto", language="en"):
	print link + '\n'
	request = urllib2.Request(link)
	result = urllib2.urlopen(request).read()
	return json.loads(result.decode('utf-8'))['data']['translations']
	

def _request(link, words):	
	for word in words:
		link = link + "&q=" + urllib.quote_plus(word)
	
	while True:
		try:
			request = urllib2.Request(link)
			result = urllib2.urlopen(request).read()
			break
		except (urllib2.URLError, urllib2.HTTPError) as error:
			e = json.loads(error.read())
			print e['error']['code'], e['error']['message']
			print link + "\n"
			if error.code == 403:
				print "sleeping 7 seconds..."
				time.sleep(7)
	
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
	lines = [word.strip() for word in inputFile.readlines()]
	for language in languages:
		print "\nProcessing language %s" % language
		skippedCtr = 0
		#dirname = os.path.dirname(inputFile.name)
		outputPath = "output/semdom-google-translate-" + language + ".txt"
		processedLines = []
		# check if there are previous translations, if so do not repeat translations for them 
		# by excluding them from list of items to be translated
		if os.path.isfile(outputPath): 
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
		
		i = 0
		preFixLink = "https://www.googleapis.com/language/translate/v2?key=%s&source=%s&target=%s" % (sys.argv[2], "en", language)
		preFixLink = preFixLink.encode('utf-8')
		link = preFixLink
		# translate and print
		# translate and print out using proper utf-8 encoding
		while i < len(processedLines):				
			wordToEncode = urllib.quote_plus(processedLines[i])
			# concat to url request as long as adding does not cause request length to exceed 5000 characters
			if len(link) + len(wordToEncode) < 5000:
				link = link + "&q=" + urllib.quote_plus(processedLines[i])
			# if url request would exceed 5000 charactesr upon adding encoded word, translate current request and start creating new one
			else:
				print "length of request: %s" % (len(link))
				translatedItems = translate(link)
				print "translating %s words" % (len(translatedItems))
				for j in range(i, i+len(translatedItems)): 
					f.write(processedLines[j] + "|" + translatedItems[j-i]['translatedText'].encode('utf-8') + "\n")
				link = preFixLink + "&q=" + wordToEncode
			i += 1
