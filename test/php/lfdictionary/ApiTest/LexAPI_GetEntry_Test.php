<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LexAPITestEnvironment.php');

class TestOfLexAPIGetEntry extends LexAPITestCase {

	function test_getEntry_noThrow() {
		$api = new LexAPI($this->_e->ProjectNodeId, $this->_e->UserId);
		$result = $api->getEntry('1234');
// 		print_r($result);
	}

}

?>