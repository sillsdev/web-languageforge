<?php
require_once('../simpletest/autorun.php');
require_once('../common/jsonRPCClient.php');

class TestOfLexAPIGetWordListRPC extends UnitTestCase {

	var $_api;
	
	function setUp() {
		$this->_api = new jsonRPCClient('http://languageforge.local/api/lex/LexAPI.php?u=61&p=91');
	}
	
	function test_getWordList_HasResult() {
		$result = $this->_api->getWordLisst(0, 50);
		$this->assertNotNull($result);
	}

}

?>