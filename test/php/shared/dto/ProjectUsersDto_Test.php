<?php

use models\shared\dto\ProjectUsersDto;
use models\UserModel;
use models\rights\Roles;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectUsersDto extends UnitTestCase {

	function testEncode_ProjectWithUser_DtoCorrect() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserModel($userId);
		$user->role = Roles::USER;

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$project->addUser($userId, Roles::USER);
		$user->addProject($projectId);
		$user->write();
		$project->write();

		$dto = ProjectUsersDto::encode($projectId);

		$this->assertEqual($dto['userCount'], 1);
		$this->assertIsA($dto['users'], 'array');
		$this->assertEqual($dto['users'][0]['id'], $userId);
		$this->assertEqual($dto['users'][0]['name'], 'Name');
		$this->assertEqual($dto['users'][0]['role'], Roles::USER);
		$this->assertFalse(isset($dto['rights']));
		$this->assertFalse(isset($dto['project']));
	}

}

?>
