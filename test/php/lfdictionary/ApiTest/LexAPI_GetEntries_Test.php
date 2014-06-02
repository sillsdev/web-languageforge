<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LexAPITestEnvironment.php');

class TestOfLexAPIGetEntries extends LexAPITestCase {

	function test_getEntries_noThrow() {
		$api = new LexAPI($this->_e->ProjectNodeId, $this->_e->UserId);
		$result = $api->getList(0, 50);
// 		print_r($result);
	}

	
}

?>