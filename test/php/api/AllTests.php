<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'api/UserAPI_Test.php');
 		$this->addFile(TestPath . 'api/ProjectAPI_Test.php');
    }

}

?>