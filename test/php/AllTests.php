<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'api/AllApiTests.php');
 		$this->addFile(TestPath . 'commands/AllCommandTests.php');
		$this->addFile(TestPath . 'model/AllModelTests.php');
    }
}
?>
