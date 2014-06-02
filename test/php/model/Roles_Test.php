<?php



use models\shared\rights\Operation;

use models\shared\rights\Domain;

use models\shared\rights\Roles;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class TestRoles extends UnitTestCase {

	function testHasRight_ProjectRealm_Ok() {
		// User Roles
		$result = Roles::hasRight(Realm::PROJECT, ProjectRoles::MEMBER, Domain::ANSWERS + Operation::CREATE);
		$this->assertTrue($result);
		$result = Roles::hasRight(Realm::PROJECT, ProjectRoles::MEMBER, Domain::USERS + Operation::CREATE);
		$this->assertFalse($result);
		// Project Admin Roles
		$result = Roles::hasRight(Realm::PROJECT, ProjectRoles::PROJECT_MANAGER, Domain::QUESTIONS + Operation::CREATE);
		$this->assertTrue($result);
		$result = Roles::hasRight(Realm::PROJECT, ProjectRoles::PROJECT_MANAGER, Domain::PROJECTS + Operation::CREATE);
		$this->assertFalse($result);
		// System Admin Roles
		$result = Roles::hasRight(Realm::PROJECT, Roles::SYSTEM_ADMIN, Domain::QUESTIONS + Operation::CREATE);
		$this->assertTrue($result);
		$result = Roles::hasRight(Realm::SITE, Roles::SYSTEM_ADMIN, Domain::USERS + Operation::CREATE);
		$this->assertTrue($result);
	}
	
	function testGetRights_Ok() {
		$result = Roles::getRightsArray(Realm::PROJECT, ProjectRoles::MEMBER);
		$this->assertIsA($result, 'array');
	}
	
}

?>