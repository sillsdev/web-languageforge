<?php
use \libraries\lfdictionary\dto\MultiText;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfMultiText extends UnitTestCase {

	function testEncode_MultiTextSingleEntry_JsonDictionary() {
		$v = new MultiText();
		$v->addForm('en', 'text');
		
		$result = json_encode($v->encode());
		
		$this->assertEqual('{"en":"text"}', $result);
	}

	function testEncode_MultiTextMultiEntry_JsonDictionary() {
		$v = new MultiText();
		$v->addForm('en', 'text1');
		$v->addForm('fr', 'text2');
		
		$result = json_encode($v->encode());
		
		$this->assertEqual('{"en":"text1","fr":"text2"}', $result);
	}
	
	function testCreate_HasCorrectForm() {
		$v = MultiText::create('en', 'text1');
		$this->assertEqual('text1', $v->getForm('en'));
	}
	
	function testCreateFromArray_TwoForms_Correct() {
		$value = array('en' => 'text1', 'fr' => 'text2');
		$v = MultiText::createFromArray($value);
		$this->assertEqual(array('en' => 'text1', 'fr' => 'text2'), $v->getAll());
	}

}

?>