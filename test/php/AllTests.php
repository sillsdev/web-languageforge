<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'DtoTest/AllTests.php');
 		$this->addFile(TestPath . 'CommandTest/AllTests.php');
// 		$this->addFile(TestPath . 'ApiTest/AllTests.php');
		$this->addFile(TestPath . 'EnvironmentTest/AllTests.php');
    }
}
?>