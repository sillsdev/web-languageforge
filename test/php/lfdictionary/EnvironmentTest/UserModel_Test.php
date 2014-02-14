<?php
use models\UserModel;
use libraries\lfdictionary\environment\EnvironmentMapper;
use libraries\lfdictionary\environment\ProjectRole;
use libraries\lfdictionary\environment\ProjectPermission;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");
require_once(dirname(__FILE__) . '/../MockObject/AllMockObjects.php');

class TestUserModel extends UnitTestCase {

	function __construct() {
		EnvironmentMapper::connect(new ProjectAccessMockEnvironment());
	}
	
	function testGetUserName_Reads() {
		$p = new UserModel(TestEnvironment::USER_ID);
		$this->assertEqual('username', $p->getUserName());
	}
	
}

?>