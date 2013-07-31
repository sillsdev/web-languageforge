<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'model/AllTests.php');
 		$this->addFile(TestPath . 'commands/AllTests.php');
 		//$this->addFile(TestPath . 'dto/AllTests.php'); // Not yet ready CP 2013-07
		$this->addFile(TestPath . 'api/AllTests.php');
    }
}
?>
