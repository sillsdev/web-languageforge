<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class AllEnvironmentTests extends TestSuite {

	function __construct() {
		parent::__construct();
		$this->addFile(TEST_PATH . 'EnvironmentTest/LFProjectAccess_Test.php');
		$this->addFile(TEST_PATH . 'EnvironmentTest/ProjectPermission_Test.php');
		$this->addFile(TEST_PATH . 'EnvironmentTest/ProjectRole_Test.php');
		$this->addFile(TEST_PATH . 'EnvironmentTest/ProjectModel_Test.php');
		$this->addFile(TEST_PATH . 'EnvironmentTest/UserModel_Test.php');
		
// 		$this->addFile(TEST_PATH . 'EnvironmentTest/CommunityModel_Test.php');
// 		$this->addFile(TEST_PATH . 'EnvironmentTest/ProjectRepository_Test.php');
	}
}

?>