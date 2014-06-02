<?php
require_once('../simpletest/autorun.php');
require_once('../common/jsonRPCClient.php');

class TestOfLexAPIImportRPC extends UnitTestCase {

	var $_api;
	
	function setUp() {
		$this->_api = new jsonRPCClient('http://languageforge.local/api/lex/LexAPI.php?u=61&p=293');
	}
	
	/* The import test is async, and sensitive to timing.  Run manually.
	function test_import_works() {
 		$result = $this->_api->import('LanguageDepot', 'testpal-dictionary', 'test', 'tset23');
 		print_r($result);
 		$this->assertNotNull($result);
	}
	*/

}

?>