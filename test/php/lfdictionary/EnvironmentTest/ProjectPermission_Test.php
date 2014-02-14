<?php 
use libraries\lfdictionary\environment\ProjectPermission;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfProjectPermission extends UnitTestCase {
	
	function testConstructor_MultipleArgs_Set() {
		$p = new ProjectPermission(ProjectPermission::CAN_ADMIN, ProjectPermission::CAN_EDIT_ENTRY);
		$this->assertTrue($p->has(ProjectPermission::CAN_ADMIN));
		$this->assertTrue($p->has(ProjectPermission::CAN_EDIT_ENTRY));
		$this->assertFalse($p->has(ProjectPermission::CAN_EDIT_REVIEW_OWN));
	}
	
}

?>
