<?php

use models\shared\rights\SiteRoles;

use models\scriptureforge\sfchecks\SfchecksRoles;

use models\shared\rights\Operation;

use models\shared\rights\Domain;

use models\shared\rights\ProjectRoles;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class TestRoles extends UnitTestCase {
 
	function testHasRight_SfchecksProject_Ok() {
		// User Roles
		$result = SfchecksRoles::hasRight(ProjectRoles::CONTRIBUTOR, Domain::ANSWERS + Operation::CREATE);
		$this->assertTrue($result);
		$result = SfchecksRoles::hasRight(ProjectRoles::CONTRIBUTOR, Domain::USERS + Operation::CREATE);
		$this->assertFalse($result);
		// Project Admin Roles
		$result = SfchecksRoles::hasRight(ProjectRoles::MANAGER, Domain::QUESTIONS + Operation::CREATE);
		$this->assertTrue($result);
		$result = SfchecksRoles::hasRight(ProjectRoles::MANAGER, Domain::PROJECTS + Operation::CREATE);
		$this->assertFalse($result);
		// System Admin Roles
		$result = SiteRoles::hasRight(SiteRoles::SYSTEM_ADMIN, Domain::USERS + Operation::CREATE);
		$this->assertTrue($result);
	}
	
	function testGetRights_Ok() {
		$result = SfchecksRoles::getRightsArray(ProjectRoles::CONTRIBUTOR);
		$this->assertIsA($result, 'array');
	}
	
}

?>