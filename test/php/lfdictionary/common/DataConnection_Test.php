<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfDataConnection extends UnitTestCase {

	function testConstructor_BogusConnection_Throws() {
		$this->expectException('\Exception');
		$d = new \libraries\lfdictionary\common\DataConnection('bogus', 'bogus', 'bogus');
	}
	
	function testConstructor_lfweb_NoThrow() {
		$d = new \libraries\lfdictionary\common\DataConnection(DB_NAME, DB_USER, DB_PASS);
		$this->assertIsA($d->mysqli, 'mysqli');
	}
	
}

?>