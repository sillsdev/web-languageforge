<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTestsNoApi extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'model/AllTests.php');
 		$this->addFile(TestPath . 'mapper/AllTests.php');
 		$this->addFile(TestPath . 'commands/AllTests.php');
 		$this->addFile(TestPath . 'dto/AllTests.php');
 		$this->addFile(TestPath . 'email/AllTests.php');
    }
}
?>
