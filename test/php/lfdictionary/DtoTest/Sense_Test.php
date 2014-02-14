<?php

use \libraries\lfdictionary\dto\MultiText;
use \libraries\lfdictionary\dto\Example;
use \libraries\lfdictionary\dto\Sense;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfSense extends UnitTestCase {

	function testEncode_DefinitionPOSAndExample_JsonCorrect() {
		$sense = new Sense();
		$sense->setDefinition(MultiText::create('en', 'definition1'));
		$sense->setPartOfSpeech('Noun');
		$sense->setSemanticDomainName('semantic-domain-ddp4');
		$sense->setSemanticDomainValue('2.1 Body');
		$example = Example::create(
			MultiText::create('en', 'example1'), 
			MultiText::create('fr', 'translation1')
		);
		$sense->addExample($example);
		
		$result = json_encode($sense->encode());
		
		$this->assertEqual('{"definition":{"en":"definition1"},"POS":"Noun","examples":[{"example":{"en":"example1"},"translation":{"fr":"translation1"}}],"SemDomValue":"2.1 Body","SemDomName":"semantic-domain-ddp4"}', $result);
	}
	
	function testSetDefinition_SetsOk() {
		$sense = new Sense();
		
		$sense->setDefinition(MultiText::create('en', 'definition1'));
				
		$this->assertEqual(array('en' => 'definition1'), $sense->_definition->getAll());
	}

	function testSetPartOfSpeech_SetsOk() {
		$sense = new Sense();
		
		$sense->setPartOfSpeech('Noun');
		
		$this->assertEqual($sense->_partOfSpeech, 'Noun');
	}
	
	function testSetSemanticDomainName_SetsOk() {
		$sense = new Sense();
	
		$sense->setSemanticDomainName('semantic-domain-ddp4');
	
		$this->assertEqual($sense->_semanticDomainName, 'semantic-domain-ddp4');
	}
	
	function testSetSemanticDomainValue_SetsOk() {
		$sense = new Sense();
	
		$sense->setSemanticDomainValue('2.1 Body');
	
		$this->assertEqual($sense->_semanticDomainValue, '2.1 Body');
	}
	
	function testCreateFromArray_DefinitionPOSOneExample_Correct() {
		$src = new Sense();
		$src->setDefinition(MultiText::create('en', 'text1'));
		$src->setPartOfSpeech('Noun');
		$src->setSemanticDomainName('semantic-domain-ddp4');
		$src->setSemanticDomainValue('2.1 Body');
		$example = Example::create(MultiText::create('en', 'example1'), MultiText::create('fr', 'translation1'));
		$src->addExample($example);
		$value = $src->encode();
		
		$v = Sense::createFromArray($value);
		$this->assertEqual(array('en' => 'text1'), $v->_definition->getAll());
		$this->assertEqual('Noun', $v->_partOfSpeech);
		$this->assertEqual(1, count($v->_examples));
		$this->assertEqual(array('en' => 'example1'), $v->_examples[0]->_example->getAll());
		$this->assertEqual(array('fr' => 'translation1'), $v->_examples[0]->_translation->getAll());
		$this->assertEqual('semantic-domain-ddp4', $v->_semanticDomainName);
		$this->assertEqual('2.1 Body', $v->_semanticDomainValue);
	}
	
	

}

?>