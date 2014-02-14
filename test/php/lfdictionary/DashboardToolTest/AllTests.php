<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH .  'autorun.php');

class AllDashboardToolTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TEST_PATH . 'DashboardToolTest/DashboardCounterExtracter_Test.php');
 		$this->addFile(TEST_PATH . 'DashboardToolTest/DashboardToolDbAccess_Test.php');
    }
}
?>