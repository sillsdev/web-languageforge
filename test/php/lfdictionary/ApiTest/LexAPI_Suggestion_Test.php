<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LexAPITestEnvironment.php');

class TestOfLexAPIGetWordsForAutoSuggest extends LexAPITestCase {

	function test_getWordsForAutoSuggest_noThrow() {
		$api = new LexAPI($this->_e->ProjectNodeId, $this->_e->UserId);
		$result = $api->getWordsForAutoSuggest('en', 'abc', 0, 10);
		// 		print_r($result);
	}


}

?>