<?php

namespace libraries\lfdictionary\commands;
require_once(dirname(__FILE__) . '/../Config.php');

use libraries\lfdictionary\dto\EntryDTO;
use libraries\lfdictionary\dto\MultiText;


class GatherWordCommand
{
	/**
	 * @var String
	 */
	var $gatherWords;

	/**
	 * @var array
	 */
	var $exitWordsArr;

	/**
	 * @var array
	 */
	var $newWordsArr;

	/**
	 * @var bool
	 */
	var $_result;

	/**
	 * @var String
	 */
	var $lang;

	/**
	 * @var Int
	 */
	var $_addedCount;

	/**
	 * @var LexStore
	 */
	var $_lexStore;

	/**
	 * @param string $filePath
	 * @param mixed $dtoEncoded
	 */
	function __construct($filePath, $language, $exitWordsArr, $gatherwords, $lexStore) {
		$this->_filePath = $filePath;
		$this->gatherWords = $gatherwords;
		$this->exitWordsArr = $exitWordsArr;
		$this->lang = $language;
		$this->_lexStore = $lexStore;

	}

	function execute() {
		$this->_addedCount=0;
		$this->processFile();
		return $this->_addedCount;
	}

	function processFile() {
		$this->gatherWords=urldecode($this->gatherWords);
		// remove exist
		$this->newWordsArr=array_diff(\libraries\lfdictionary\common\WordsParser::parsingToArray($this->gatherWords) ,$this->exitWordsArr);

		if (count($this->newWordsArr)>0){

			$now = \libraries\lfdictionary\mapper\LiftUpdater::now();
			$filePath = \libraries\lfdictionary\mapper\LiftUpdater::updateFilePath($this->_filePath, $now);
			$rootXml = new \SimpleXMLElement('<lift />');
			// loop words array to add text
			foreach ($this->newWordsArr as $results) {
				if ($wordEntry=trim($results)!=""){
					$entryXml = $rootXml->addChild('entry');
					$entryXml['dateCreated'] = $entryXml['dateModified'] = gmdate("Y-m-d\TH:i:s\Z");
					$entryXml['guid'] = \libraries\lfdictionary\common\UUIDGenerate::uuid_generate_php();
					$entryXml['id'] = $results . "_" . $entryXml['guid'];

					$ChildUnitXml=$entryXml->addChild('lexical-unit');
					$ChildForm=$ChildUnitXml->addChild('form');
					$ChildForm->addAttribute('lang', $this->lang);
					$ChildForm->addChild('text',$results);
					$this->saveIntoDatabase($this->lang, $results);
					$this->_addedCount += 1;
				}
			}
			$this->_result = $rootXml->saveXML($filePath) ;
		}
	}

	function saveIntoDatabase($lang, $word)
	{
		if (isset($this->_lexStore))
		{
			$entryDTO = EntryDTO::create(\libraries\lfdictionary\common\UUIDGenerate::uuid_generate_php());
			$entryDTO->setEntry(MultiText::create($lang, $word));
			$this->_lexStore->writeEntry($entryDTO, 'new');
		}
	}
};

?>