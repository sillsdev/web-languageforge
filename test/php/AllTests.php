<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'model/AllTests.php');
 		$this->addFile(TestPath . 'commands/AllTests.php');
 		$this->addFile(TestPath . 'dto/AllTests.php');
		$this->addFile(TestPath . 'api/AllTests.php');
    }
}
?>
