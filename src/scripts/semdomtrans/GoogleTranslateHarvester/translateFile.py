import urllib2
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
	for word in listOfWordsToTranslate:
		link = link + "&q=" + word
	link = link.replace(" ", "+")
	print link + "\n"
	request = urllib2.Request(link)
	result = urllib2.urlopen(request).read()
	return json.loads(result)['data']['translations']

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
		dirname = os.path.dirname(inputFile.name)
		outputPath = dirname + "/semdom-google-translate-" + language + ".txt"
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
			processedLines = lines			
		
		f = open(outputPath,'a')
		# translate and print out using proper utf-8 encoding
		for i in xrange(0, len(processedLines), 100):				
			translatedItems = translate(processedLines[i:i+100], sys.argv[2], language)
			for j in range(i, min(len(processedLines), i+100)):
				f.write(processedLines[j].encode('utf-8') + "|" + translatedItems[j]['translatedText'].encode('utf-8') + "\n")