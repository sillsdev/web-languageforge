<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'AllTests_NoApi.php');
		$this->addFile(TestPath . 'api/AllTests.php');
    }
}
?>
