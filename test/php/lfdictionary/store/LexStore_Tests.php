<?php
use libraries\lfdictionary\environment\MissingInfoType;
use libraries\lfdictionary\store\LexStoreController;
use libraries\lfdictionary\store\LexStoreType;
use libraries\lfdictionary\dto\EntryDTO;
use libraries\lfdictionary\dto\Sense;
use libraries\lfdictionary\dto\Example;
use libraries\lfdictionary\dto\MultiText;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once(SOURCE_PATH . 'store/LexStoreController.php');
require_once('MongoTestEnvironment.php');
require_once('LiftTestEnvironment.php');
require_once(dirname(__FILE__) . '/../MockObject/AllMockObjects.php');

require_once(dirname(__FILE__) . '/../MockObject/LexProjectMockObject.php');


/**
 * Test of LexStore
 * For now, this just does the same tests as LexStoreMongo_Tests. This should be improved as Lift update functionality is added
 * back in.
 */
class TestOfLexStore extends UnitTestCase {

	function setUp() {
		$e = MongoTestEnvironment::create();
		$e->removeAll();
	}
	
	function tearDown() {
		$e = MongoTestEnvironment::create();
		$e->removeAll();
	}
	
	function getStore($database) {
		return new LexStoreController(LexStoreType::STORE_MONGO, $database, new LexProjectMockObject());
	}
	
	/**
	 * 
	 * @param MongoTestEnvironment $mongoEnvironment
	 * @param StoreLiftTestEnvironment $liftEnvironment
	 */
	function getStoreFromEnvironment($mongoEnvironment, $liftEnvironment) {
		return new LexStoreController(LexStoreType::STORE_MONGO, $mongoEnvironment->database, new LexProjectMockObject($liftEnvironment));
	}
	
	function testWriteRead_SimpleEntry_ReadsBack() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
		$guid = MongoTestEnvironment::guid();
		$entry1 =  EntryDTO::create($guid);
		
		// Write the Entry
		$store->writeEntry($entry1, '');
		
		// Read it back
		$entry2 = $store->readEntry($guid);
		
		$this->assertEqual($entry1, $entry2);
	}
	
	function testWriteRead_Entry_ReadsBack() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
		$guid = MongoTestEnvironment::guid();
		$entry1 =  EntryDTO::create($guid);
		$sense = Sense::create();
		$example = Example::create(
			MultiText::create('en', 'example'),
			MultiText::create('fr', 'example translation')
		);
		$sense->addExample($example);
		$entry1->addSense($sense);
		
		// Write the Entry
		$store->writeEntry($entry1, '');
		
		// Read it back
		$entry2 = $store->readEntry($guid);
		$this->assertEqual($entry1, $entry2);
	}
	
	function testEntryCount_FourEntries_ReturnsFour() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
		$e->ensureEntries(4, 0, 0);
		$result = $store->entryCount();
		$this->assertEqual(4, $result);
	}

	function testDeleteEntry_ThreeEntries_Deletes() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
		$guid1 = MongoTestEnvironment::guid();
		$guid2 = MongoTestEnvironment::guid();
		$guid3 = MongoTestEnvironment::guid();
		$e->writeTestEntry($guid1, 0);
		$e->writeTestEntry($guid2, 1);
		$e->writeTestEntry($guid3, 2);

		$store = $this->getStore($e->database);
		$count = $store->entryCount();
		$this->assertEqual(3, $count);
		
		$store->deleteEntry($guid2, 'somesha');
		$count = $store->entryCount();
		$this->assertEqual(2, $count);
	}
	
	function testReadEntriesAsListDTO_ReadsOk() {
		$e = MongoTestEnvironment::create();
		$e->ensureEntries(3);
		$store = $this->getStore($e->database);
		$result = $store->readEntriesAsListDTO(0, 10);
		$this->assertEqual(3, count($result->entries));
		$this->assertEqual(3, $result->entryCount);
		$this->assertEqual(0, $result->entryBeginIndex);
		$this->assertEqual(2, $result->entryEndIndex);
		// TODO add more assertEqual here to check content. CP 2012-10
	}
	
	function testReadEntriesAsListDTO_ZeroRequested_ReturnsResult() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
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
		$store = $this->getStore($e->database);
		
		$result = $store->readSuggestions('en', 'block', 0, 100);
		$this->assertEqual(1, count($result->_entries));
	}

	function testReadSuggestions_LimitOneManyMatches_ReturnsOne() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $this->getStore($e->database);
		
		$result = $store->readSuggestions('en', 'oat', 0, 1);
		$this->assertEqual(1, count($result->_entries));
	}
	
	function testReadSuggestions_CloseMatchNotFirstLetter_ReturnsSix() {
		$e = MongoTestEnvironment::create();
		$e->writeTestEntriesFromArray(
			array('floats', 'boats', 'oats', 'stoats','goat','coat','ecgroup','clock','block','socks')
		);
		$store = $this->getStore($e->database);
		
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
		$store = $this->getStore($e->database);
		
		$result = $store->readSuggestions('en', 'ABC', 0, 100);
		$this->assertEqual(0, count($result->_entries));
	}
	
	function testMissingInfo_Definition_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
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
		$store->writeEntry($entry, '');
		
		$result = $store->readMissingInfo(MissingInfoType::MEANING);
		$this->assertEqual(1, count($result->entries));
	}
	
	function testMissingInfo_PartOfSpeech_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
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
		$store->writeEntry($entry, '');
		
		$result = $store->readMissingInfo(MissingInfoType::GRAMMATICAL);
		$this->assertEqual(1, count($result->entries));
	}
	
	function testMissingInfo_Example_Returns() {
		$e = MongoTestEnvironment::create();
		$store = $this->getStore($e->database);
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
		$store->writeEntry($entry, '');
		
		$result = $store->readMissingInfo(MissingInfoType::EXAMPLE);
		$this->assertEqual(1, count($result->entries));
	}
	
	const liftTwoEntries = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2009-10-12T04:05:40Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูรอบ</text>
			</form>
		</lexical-unit>
	</entry>
	<entry
		id="05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;
	
	function testUpdateFromLift_TwoNewEntriesInLift_AppearInMongo() {
		$me = MongoTestEnvironment::create();
		$le = StoreLiftTestEnvironment::create();
		$le->writeLiftToFile(self::liftTwoEntries);
		$store = $this->getStoreFromEnvironment($me, $le);
		
		$result = $store->readEntriesAsListDTO(0, 10);

		$this->assertEqual(2, count($result->entries));
		$this->assertEqual('dd15cbc4-9085-4d66-af3d-8428f078a7da', $result->entries[0]->guid);
		$this->assertEqual('05473cb0-4165-4923-8d81-02f8b8ed3f26', $result->entries[1]->guid);
	}
	
}

?>
