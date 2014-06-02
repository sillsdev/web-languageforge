<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once('LexAPITestEnvironment.php');

class TestOfLexAPISaveEntry extends LexAPITestCase {

	function test_saveEntry_noThrow() {
		$json = <<<EOD
{"id":3,"method":"saveEntry","params":["{\"guid\":\"147F4470-C5AB-43C8-B1AE-23E3F13DC76A\",\"mercurialSHA\":null,\"entry\":{\"mi\":\"the word\"},\"senses\":[]}","update"]}
EOD;
		$request = json_decode($json);
		$params = $request->params;
		$entry = $params[0];
// 		print_r($entry);
		$api = new LexAPI($this->_e->ProjectNodeId, $this->_e->UserId);
		$result = $api->saveEntry($entry, 'update');
// 		print_r($result);
	}

	
}

?>