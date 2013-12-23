<?php

use models\dto\ProjectSettingsDto;
use models\UserModel;
use models\rights\Roles;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectSettingsDto extends UnitTestCase {

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

		$dto = ProjectSettingsDto::encode($projectId, $userId);

		$this->assertEqual($dto['count'], 1);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $userId);
		$this->assertEqual($dto['entries'][0]['name'], 'Name');
		$this->assertEqual($dto['entries'][0]['role'], Roles::USER);
		$this->assertTrue(count($dto['rights']) > 0, "No rights in dto");
		$this->assertEqual($dto['bcs']['op'], 'settings');
		$this->assertEqual($dto['bcs']['project'], array('id' => $projectId, 'crumb' => SF_TESTPROJECT));
		$this->assertFalse(isset($dto['project']['users']));
		$this->assertEqual($dto['project']['id'], $projectId);
	}

}

?>
