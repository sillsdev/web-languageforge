<?php
namespace libraries\lfdictionary\commands;

use models\lex\LexEntryModel;
use models\lex\MultiText;
use libraries\lfdictionary\common\UUIDGenerate;
use libraries\lfdictionary\common\WordsParser;
use libraries\lfdictionary\mapper\LiftUpdater;

require_once(dirname(__FILE__) . '/../Config.php');

/**
 * GatherWordCommand imports data from a text file into the Lift file *and* saves it into the mongo database.
 * TODO Rename. GatherWordsImportFromFile (or text it could do both). CP 2013-12
 * TODO Enhance. No need to save direct to lift.  We will need a general mongo -> lift writer which should handle this. CP 2013-12
 */
class GatherWordCommand {

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
		$this->newWordsArr=array_diff(WordsParser::parsingToArray($this->gatherWords) ,$this->exitWordsArr);

		if (count($this->newWordsArr)>0) {
			$now = LiftUpdater::now();
			// TODO The LiftUpdater should not be called directly here, rather in the course of processing the file the LexEntryCommands::addEntry(...) should be called which in turn would do this (in addition to updating activity etc). CP 2013-12
			$filePath = LiftUpdater::updateFilePath($this->_filePath, $now);
			$rootXml = new \SimpleXMLElement('<lift />');
			// loop words array to add text
			foreach ($this->newWordsArr as $results) {
				if ($wordEntry=trim($results)!="") {
					$entryXml = $rootXml->addChild('entry');
					$entryXml['dateCreated'] = $entryXml['dateModified'] = gmdate("Y-m-d\TH:i:s\Z");
					$entryXml['guid'] = UUIDGenerate::uuid_generate_php();
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

	function saveIntoDatabase($lang, $word) {
		if (isset($this->_lexStore)) {
			$entryDTO = LexEntryModel::create(UUIDGenerate::uuid_generate_php());
			$entryDTO->setEntry(MultiText::create($lang, $word));
			$this->_lexStore->writeEntry($entryDTO, 'new');
		}
	}
	
};

?>