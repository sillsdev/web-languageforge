<?php

use \libraries\lfdictionary\dto\Example;
use \libraries\lfdictionary\dto\EntryDTO;
use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\Sense;
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfEntryDTO extends UnitTestCase {

	function testEncode_EntryAndSense_JsonCorrect() {
		$entry = EntryDTO::create("guid0");
		$entry->setEntry(MultiText::create('fr', 'form1'));
		
		$sense = new Sense();
		$sense->setDefinition(MultiText::create('en', 'definition1'));
		$sense->setSemanticDomainName('semantic-domain-ddp4');
		$sense->setSemanticDomainValue('2.1 Body');
		$sense->addExample(Example::create(
			MultiText::create('en', 'example1'),
			MultiText::create('fr', 'translation1')
		));
		
		$entry->addSense($sense);
		
		$result = json_encode($entry->encode());
		
		$this->assertEqual('{"guid":"guid0","mercurialSHA":null,"entry":{"fr":"form1"},"senses":[{"definition":{"en":"definition1"},"POS":"","examples":[{"example":{"en":"example1"},"translation":{"fr":"translation1"}}],"SemDomValue":"2.1 Body","SemDomName":"semantic-domain-ddp4"}]}', $result);
	}
	
	function testCreateFromArray_Sample_Correct() {
		$entry = EntryDTO::create("guid0");
		$entry->setEntry(MultiText::create('fr', 'form1'));
		
		$sense = new Sense();
		$sense->setDefinition(MultiText::create('en', 'definition1'));
		$sense->setPartOfSpeech('Noun');
		$sense->setSemanticDomainName('semantic-domain-ddp4');
		$sense->setSemanticDomainValue('2.1 Body');
		$sense->addExample(Example::create(
			MultiText::create('en', 'example1'),
			MultiText::create('fr', 'translation1')
		));
		
		$entry->addSense($sense);
				
		$value = $entry->encode();
		
		$v = EntryDTO::createFromArray($value);
		
		$this->assertEqual('guid0', $v->_guid);
		$this->assertEqual(array('fr' => 'form1'), $v->_entry->getAll());
		$this->assertEqual(array('en' => 'definition1'), $v->_senses[0]->_definition->getAll());
		$this->assertEqual('Noun', $v->_senses[0]->_partOfSpeech);
		$this->assertEqual(1, count($v->_senses[0]->_examples));
		$this->assertEqual(array('en' => 'example1'), $v->_senses[0]->_examples[0]->_example->getAll());
		$this->assertEqual(array('fr' => 'translation1'), $v->_senses[0]->_examples[0]->_translation->getAll());
		$this->assertEqual('semantic-domain-ddp4', $v->_senses[0]->_semanticDomainName);
		$this->assertEqual('2.1 Body', $v->_senses[0]->_semanticDomainValue);
				
		
	}

}

?>