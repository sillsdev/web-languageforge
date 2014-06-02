<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(DicTestPath . 'CommandTest/LiftTestEnvironment.php');

class TestOfGetWordCommand extends UnitTestCase {

	/*
	 *  Note: 2013-08-27  These tests are testing GetWordCommand which no longer exists in the current codebase.
	 *  My suspicion is that these tests were written before a significant refactor/rename, and the tests were never refactored
	 *  cjh
	 */
	function testWordCommand_TwoEntries_OneGuidWordAndMeaningsAndAllSense() {
// 		$e = new LiftTestEnvironment();
// 		//2 entry, 2 word, 2sense, 1definition, 1 partofspeech, 2examples, 1exampleform
// 		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);
		
// 		$command = new \commands\GetWordCommand($e->getLiftFilePath(), 'guid0');
// 		$result = $command->execute();	
		
// 		// guids
// 		$this->assertEqual("guid0", $result->_guid);		
// 		// entry
// 		$this->assertEqual("entry 0 text 0", $result->_entry->getForm('qaa-x-0'));
// 		$this->assertEqual("entry 0 text 1", $result->_entry->getForm('qaa-x-1'));
		
// 		// sense
// 		$this->assertEqual(2, count($result->_senses));
		
// 		// definition
// 		$this->assertEqual("entry 0 sense 0 text 0", $result->_senses[0]->_definition->getForm('qaa-x-0'));
// 		// partofspeech
// 		$this->assertEqual("Noun", $result->_senses[0]->_partOfSpeech);
		
// 		// examples
// 		$this->assertEqual(2, count($result->_senses[0]->_examples));
// 		$this->assertEqual("entry 0 sense 0 example 0 text 0", $result->_senses[0]->_examples[0]->_example->getForm('qaa-x-0'));
// 		$this->assertEqual("entry 0 sense 0 example 1 text 0", $result->_senses[0]->_examples[1]->_example->getForm('qaa-x-0'));
// 		$this->assertEqual("entry 0 sense 1 example 0 text 0", $result->_senses[1]->_examples[0]->_example->getForm('qaa-x-0'));
		
// 		// translation
// 		$this->assertEqual("entry 0 sense 0 translation 0 text 0", $result->_senses[0]->_examples[0]->_translation->getForm('qaa-x-0'));

	}

// 	function testWordCommand_OneEntryNoWordForms_NoListEntries() {
// 		$e = new LiftTestEnvironment();
// 		$e->createLiftWith(1, 0, 0, 0, 0, 0, 0);
		
// 		$command = new \commands\GetWordCommand($e->getLiftFilePath(), 'guid0');
// 		$result = $command->execute();
		
// 		$this->assertEqual(0, count($result->_senses));

// 	}

//  function testWordCommand_OneEntryNoWordFormsSenseAndMeaning_NoListEntries() {
// 		$e = new LiftTestEnvironment();
// 		$e->createLiftWith(1, 1, 1, 1, 0, 0, 0);
		
// 		$command = new \commands\GetWordCommand($e->getLiftFilePath(), 'guid0');
// 		$result = $command->execute();
		
// 		$this->assertEqual(0, count($result->_senses[0]->_examples));
// 		$this->assertEqual("", $result->_senses[0]->_partOfSpeech);
// 	}
}

?>