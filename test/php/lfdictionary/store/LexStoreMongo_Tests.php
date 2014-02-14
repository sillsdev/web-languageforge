<?php
use libraries\lfdictionary\environment\MissingInfoType; 
use store\mongo\MongoLexStore;
use libraries\lfdictionary\dto\EntryDTO;
use libraries\lfdictionary\dto\Sense;
use libraries\lfdictionary\dto\Example;
use libraries\lfdictionary\dto\MultiText;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once('MongoTestEnvironment.php');

class TestOfLexStoreMongo extends UnitTestCase {

	function setUp() {
		$e = MongoTestEnvironment::create();
		$e->removeAll();
	}
	
	function tearDown() {
		$e = MongoTestEnvironment::create();
		$e->removeAll();
	}
	
	function testConnect_TypeAndSameReference_ReturnsLexStoreMongo() {
		$e = MongoTestEnvironment::create();
		$result1 = $e->testStore();
		$this->assertIsA($result1, 'MongoLexStore');
		$result2 = $e->testStore();
		$this->assertReference($result1, $result2);
	}
	
	function testWriteRead_SimpleEntry_ReadsBack() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$guid = MongoTestEnvironment::guid();
		$entry1 = EntryDTO::create($guid);
		
		// Write the Entry
		$store->writeEntry($entry1);
		
		// Read it back
		$entry2 = $store->readEntry($guid);
		
		$this->assertEqual($entry1, $entry2);
	}
	
	function testWriteRead_Entry_ReadsBack() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$guid = MongoTestEnvironment::guid();
		$entry1 = EntryDTO::create($guid);
		$sense = Sense::create();
		$example = Example::create(
			MultiText::create('en', 'example'),
			MultiText::create('fr', 'example translation')
		);
		$sense->addExample($example);
		$entry1->addSense($sense);
		
		// Write the Entry
		$store->writeEntry($entry1);
		
		// Read it back
		$entry2 = $store->readEntry($guid);
		$this->assertEqual($entry1, $entry2);
	}
	
	function testEntryCount_FourEntries_ReturnsFour() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$e->ensureEntries(4, 0, 0);
		$result = $store->entryCount();
		$this->assertEqual(4, $result);
	}

	function testDeleteEntry_ThreeEntries_Deletes() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$guid1 = MongoTestEnvironment::guid();
		$guid2 = MongoTestEnvironment::guid();
		$guid3 = MongoTestEnvironment::guid();
		$e->writeTestEntry($guid1, 0);
		$e->writeTestEntry($guid2, 1);
		$e->writeTestEntry($guid3, 2);

		$store = $e->testStore();
		$count = $store->entryCount();
		$this->assertEqual(3, $count);
		
		$store->deleteEntry($guid2);
		$count = $store->entryCount();
		$this->assertEqual(2, $count);
	}
	
	function testReadEntriesAsListDTO_ReadsOk() {
		$e = MongoTestEnvironment::create();
		$e->ensureEntries(3);
		$store = $e->testStore();
		$result = $store->readEntriesAsListDTO(0, 10);
		$this->assertEqual(3, count($result->entries));
		$this->assertEqual(3, $result->entryCount);
		$this->assertEqual(0, $result->entryBeginIndex);
		$this->assertEqual(2, $result->entryEndIndex);
		// TODO add more assertEqual here to check content. CP 2012-10
	}
	
	function testReadEntriesAsListDTO_ZeroRequested_ReturnsResult() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$result = $store->readEntriesAsListDTO(0, 60);
		$this->assertEqual(0, count($result->entries));
		$this->assertEqual(0, $result->entryCount);
		$this->assertEqual(0, $result->entryBeginIndex);
		$this->assertEqual(0, $result->entryEndIndex);
		// TODO add more assertEqual here to check content. CP 2012-10
	}
	
	function testReadSuggestions_ExactMatch_ReturnsOne() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $e->testStore();
		
		$result = $store->readSuggestions('en', 'block', 0, 100);
		$this->assertEqual(1, count($result->_entries));
	}

	function testReadSuggestions_LimitOneManyMatches_ReturnsOne() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $e->testStore();
		
		$result = $store->readSuggestions('en', 'oat', 0, 1);
		$this->assertEqual(1, count($result->_entries));
	}
	
	function testReadSuggestions_CloseMatchNotFirstLetter_ReturnsSix() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $e->testStore();
		
		$result = $store->readSuggestions('en', 'oat', 0, 100);
		$this->assertEqual(6, count($result->_entries));
		$this->assertEqual(6, $result->entryCount);
// 		$entry = $result->_entries[0];
// 		$this->assertEqual('goat', $entry->word);
	}
	
	function testReadSuggestions_EmptyMatch_ReturnsZeroEntries() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $e->testStore();
		
		$result = $store->readSuggestions('en', 'ABC', 0, 100);
		$this->assertEqual(0, count($result->_entries));
	}
	
	function testMissingInfo_Definition_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$e->ensureEntries(2);
		
		$guid = MongoTestEnvironment::guid();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('fr', 'word'));
		$sense = Sense::create();
		$sense->setPartOfSpeech('n');
// 		$sense->setDefinition(MultiText::create('en', "Definition"));
		$example = Example::create(
			MultiText::create('fr', "Example"),
			MultiText::create('en', "Example Translation")
		);
		$sense->addExample($example);
		$entry->addSense($sense);
		$store->writeEntry($entry);
		
		$result = $store->readMissingInfo(MissingInfoType::MEANING);
		$this->assertEqual(1, count($result->entries));
	}
	
	function testMissingInfo_PartOfSpeech_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$e->ensureEntries(2);
				
		$guid = MongoTestEnvironment::guid();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('fr', 'word'));
		$sense = Sense::create();
// 		$sense->setPartOfSpeech('');
		$sense->setDefinition(MultiText::create('en', "Definition"));
		$example = Example::create(
			MultiText::create('fr', "Example"),
			MultiText::create('en', "Example Translation")
		);
		$sense->addExample($example);
		$entry->addSense($sense);
		$store->writeEntry($entry);
		
		$result = $store->readMissingInfo(MissingInfoType::GRAMMATICAL);
		$this->assertEqual(1, count($result->entries));
	}
	
	function testMissingInfo_Example_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$e->ensureEntries(2);
				
		$guid = MongoTestEnvironment::guid();
		$entry = EntryDTO::create($guid);
		$entry->setEntry(MultiText::create('fr', 'word'));
		$sense = Sense::create();
		$sense->setPartOfSpeech('n');
		$sense->setDefinition(MultiText::create('en', "Definition"));
// 		$example = Example::create(
// 			MultiText::create('fr', "Example"),
// 			MultiText::create('en', "Example Translation")
// 		);
// 		$sense->addExample($example);
		$entry->addSense($sense);
		$store->writeEntry($entry);
		
		$result = $store->readMissingInfo(MissingInfoType::EXAMPLE);
		$this->assertEqual(1, count($result->entries));
	}
	
	function testReadHashOfLastUpdate_ReadWriteReadBackCorrect() {
		$e = MongoTestEnvironment::create();
		$store = $e->testStore();
		$result = $store->readHashOfLastUpdate();
		$this->assertEqual('', $result);
		$store->writeHashOfLastUpdate('SomeHash');
		$result = $store->readHashOfLastUpdate();
		$this->assertEqual('SomeHash', $result);
	}	
	
}

?>
