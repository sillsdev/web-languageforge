<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfDataConnector extends UnitTestCase {

	function testConnect_Defaults_SameReference() {
		$d1 = \libraries\lfdictionary\common\DataConnector::connect();
		$this->assertIsA($d1, '\libraries\lfdictionary\common\DataConnection');
		$d2 = \libraries\lfdictionary\common\DataConnector::connect();
		$this->assertReference($d1, $d2);
	}
	
}

?>