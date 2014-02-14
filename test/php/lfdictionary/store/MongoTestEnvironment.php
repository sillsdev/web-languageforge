<?php

use libraries\lfdictionary\store\mongo\MongoLexStore;
use libraries\lfdictionary\dto\MultiText;
use libraries\lfdictionary\dto\EntryDTO;
use libraries\lfdictionary\dto\Sense;
use libraries\lfdictionary\dto\Example;

class MongoTestEnvironment {

	const DATABASE_NAME = "qaa-Test_Project-dictionary";

	/**
	 * @var string
	 */
	public $database;
	
	/**
	 * @param string $database
	 */
	private function __construct($database) {
		$this->database = $database;
	}
	
	public static function create($database = self::DATABASE_NAME) {
		return new MongoTestEnvironment($database);
	}
	
	public function testStore() {
		return MongoLexStore::connect($this->database);
	}

	public function testDatabase() {
		$mongo = new Mongo();
		$db = $mongo->selectDb($this->database);
		return $db;
	}
	
	public function removeAll() {
		$db = $this->testDatabase();
		$db->Entries->remove(array(), array('safe' => true));
		$db->System->remove(array(), array('safe' => true));
	}

	/**
	 * Ensures that there is only $recordCount Entries in the collection.
	 * @param int $recordCount
	 */
	public function ensureEntries($recordCount, $senseCount = 1, $exampleCount = 1) {
		$this->removeAll();
		$store = $this->testStore();
		for ($i = 0; $i < $recordCount; $i++) {
			$store->writeEntry(self::createTestEntry(self::guid(), $i, $senseCount, $exampleCount));
		}
	}

	public function writeTestEntry($guid, $id, $senseCount = 1, $exampleCount = 1) {
		$store = $this->testStore();
		$store->writeEntry(self::createTestEntry($guid, $id, $senseCount, $exampleCount));
	}

	public function writeTestEntriesFromArray($words) {
		$this->removeAll();
		$store = $this->testStore();
		foreach ($words as $word) {
			$guid = self::guid();
			$entry = self::createTestEntry($guid, 1, 1, 0);
			$entry->setEntry(MultiText::create('en', $word));
			$store->writeEntry($entry);
		}
	}

	private static function createTestEntry($guid, $id, $senseCount = 1, $exampleCount = 1) {
		$entry = EntryDTO::create($guid);
		$word = "Word $id";
		$entry->setEntry(MultiText::create('fr', $word));
		for ($i = 0; $i < $senseCount; $i++) {
			$sense = Sense::create();
			$sense->setPartOfSpeech('n');
			$sense->setDefinition(MultiText::create('en', "$word Definition $i"));
			for ($j = 0; $j < $exampleCount; $j++) {
				$example = Example::create(
						MultiText::create('fr', "$word Example $j"),
						MultiText::create('en', "$word Example Translation $j")
				);
				$sense->addExample($example);
			}
			$entry->addSense($sense);
		}
		return $entry;
	}

	static function guid(){
		if (function_exists('com_create_guid')) {
			return com_create_guid();
		} else {
			mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
			$charid = strtoupper(md5(uniqid(rand(), true)));
			$hyphen = chr(45); // '-'
			// 			$uuid = chr(123)   // '{'
			$uuid = substr($charid, 0, 8).$hyphen
			.substr($charid, 8, 4).$hyphen
			.substr($charid,12, 4).$hyphen
			.substr($charid,16, 4).$hyphen
			.substr($charid,20,12);
			// 				.chr(125);// "}"
			return $uuid;
		}
	}

}

?>
