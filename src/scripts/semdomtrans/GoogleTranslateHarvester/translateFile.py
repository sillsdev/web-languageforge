import urllib2
import urllib
import sys
import os
import json
import os.path
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
	if listOfWordsToTranslate.join('').len() < 4700:
		return _request(link, listOfWordsToTranslate)
	else:
		return _request(link, listOfWordsToTranslate[0:5]) + _request(listOfWordsToTranslate[5:10])
	

def _request(link, words):	
	for word in words:
		link = link + "&q=" + urllib.quote_plus(word)
	print link + '\n'
	request = urllib2.Request(link)
	result = urllib2.urlopen(request).read()
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
		# translate and print out using proper utf-8 encoding
			print "processing %s language line %d" % (language, i)
		for i in xrange(0, len(processedLines), 10):			
			translatedItems = translate(processedLines[i:i+10], sys.argv[2], language)
			for j in range(i, min(len(processedLines), i+10)):
				f.write(processedLines[j] + "|" + translatedItems[j%10]['translatedText'].encode('utf-8') + "\n")
