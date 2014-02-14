<?php
use libraries\lfdictionary\store\LiftScanner;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LiftTestEnvironment.php');

class TestOfLiftScanner extends UnitTestCase {

	function testWordCommand_TwoEntries_OneGuidWordAndMeaningsAndAllSense() {
		$e = StoreLiftTestEnvironment::create();
		//2 entry, 2 word, 2 sense, 1 definition, 1 partOfSpeech, 2 examples, 1 exampleform
		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);
	
		$scanner = new LiftScanner($e->getLiftFilePath());
		$result = $scanner->readEntryFromGuid('guid0');
	
		// guids
		$this->assertEqual("guid0", $result->_guid);
		// entry
		$this->assertEqual("entry 0 text 0", $result->_entry->getForm('qaa-x-0'));
		$this->assertEqual("entry 0 text 1", $result->_entry->getForm('qaa-x-1'));
	
		// sense
		$this->assertEqual(2, count($result->_senses));
	
		// definition
		$this->assertEqual("entry 0 sense 0 text 0", $result->_senses[0]->_definition->getForm('qaa-x-0'));
		// partofspeech
		$this->assertEqual("Noun", $result->_senses[0]->_partOfSpeech);
	
		// examples
		$this->assertEqual(2, count($result->_senses[0]->_examples));
		$this->assertEqual("entry 0 sense 0 example 0 text 0", $result->_senses[0]->_examples[0]->_example->getForm('qaa-x-0'));
		$this->assertEqual("entry 0 sense 0 example 1 text 0", $result->_senses[0]->_examples[1]->_example->getForm('qaa-x-0'));
		$this->assertEqual("entry 0 sense 1 example 0 text 0", $result->_senses[1]->_examples[0]->_example->getForm('qaa-x-0'));
	
		// translation
		$this->assertEqual("entry 0 sense 0 translation 0 text 0", $result->_senses[0]->_examples[0]->_translation->getForm('qaa-x-0'));
	
	
		$e->dispose();
	}

}

?>