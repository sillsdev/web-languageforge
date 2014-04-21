<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

class AllTests extends TestSuite {
    function __construct() {
        parent::__construct();
		$this->addFile(TEST_PATH . 'DtoTest/AllTests.php');
		$this->addFile(TEST_PATH . 'CommandTest/AllTests.php');
		$this->addFile(TEST_PATH . 'MapperTest/AllTests.php');
		$this->addFile(TEST_PATH . 'store/AllTests.php');
		$this->addFile(TEST_PATH . 'EnvironmentTest/AllTests.php');
		//$this->addFile(TEST_PATH . 'APITest/AllTests.php');
		$this->addFile(TEST_PATH . 'DashboardToolTest/AllTests.php');
		$this->addFile(TEST_PATH . 'TransliterationTest/AllTests.php');
    }
}
?>