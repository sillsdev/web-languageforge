<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LexAPITestEnvironment.php');

class TestOfLexAPIDeleteEntry extends LexAPITestCase {

	function test_deleteEntry_noThrow() {
		$api = new LexAPI($this->_e->ProjectNodeId, $this->_e->UserId);
		$guid = '1234';
		$sha = '5678';
		$result = $api->deleteEntry($guid, $sha);
	}

	
}

?>