<?php

use \libraries\lfdictionary\dto\EntryListDTO;
use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\EntryDTO;
use \libraries\lfdictionary\dto\Sense;
use \libraries\lfdictionary\dto\Example;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfEntryListDTO extends UnitTestCase {

	function testEntryListDTO_Encode_EntryAndSense_JsonCorrect() {
		$entry = new EntryListDTO();
		
		$entry1 = EntryDTO::create("guid0");
		$entry1->setEntry(MultiText::create('fr', 'form1'));
		
		$sense1 = new Sense();
		$sense1->setDefinition(MultiText::create('en', 'definition1'));
		$sense1->setSemanticDomainName('semantic-domain-ddp4');
		$sense1->setSemanticDomainValue('2.1 Body');
		$sense1->addExample(Example::create(
			MultiText::create('en', 'example1'),
			MultiText::create('fr', 'translation1')
		));
		$entry1->addSense($sense1);
		
		$entry2 = EntryDTO::create("guid1");
		$entry2->setEntry(MultiText::create('th', 'form2'));
		
		$sense2 = new Sense();
		$sense2->setDefinition(MultiText::create('en', 'definition2'));
		$sense2->setSemanticDomainName('semantic-domain-ddp4');
		$sense2->setSemanticDomainValue('2.1 Body');
		$sense2->addExample(Example::create(
		MultiText::create('fr', 'example2'),
		MultiText::create('th', 'translation2')
		));
		$entry2->addSense($sense2);
		
		$entry->addEntry($entry1);
		$entry->addEntry($entry2);
		$entry->entryCount=2;
		
		$result = json_encode($entry->encode());
		$this->assertEqual('{"count":2,"entries":[{"guid":"guid0","mercurialSHA":null,"entry":{"fr":"form1"},"senses":[{"definition":{"en":"definition1"},"POS":"","examples":[{"example":{"en":"example1"},"translation":{"fr":"translation1"}}],"SemDomValue":"2.1 Body","SemDomName":"semantic-domain-ddp4"}]},{"guid":"guid1","mercurialSHA":null,"entry":{"th":"form2"},"senses":[{"definition":{"en":"definition2"},"POS":"","examples":[{"example":{"fr":"example2"},"translation":{"th":"translation2"}}],"SemDomValue":"2.1 Body","SemDomName":"semantic-domain-ddp4"}]}]}', $result);
	}

}

?>