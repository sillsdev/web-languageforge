<?php

use models\shared\rights\SiteRoles;

use models\scriptureforge\dto\ProjectSettingsDto;
use models\UserModel;
use models\shared\rights\ProjectRoles;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectSettingsDto extends UnitTestCase {

	function testEncode_ProjectWith2Users1Unvalidated_DtoCorrect1User() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$user1Id = $e->createUser("", "", "");
		$user1 = new UserModel($user1Id);
		$user1->role = SiteRoles::USER;

		$user2Id = $e->createUser("User", "Name", "name@example.com");
		$user2 = new UserModel($user2Id);
		$user2->role = SiteRoles::USER;

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$project->addUser($user1Id, ProjectRoles::CONTRIBUTOR);
		$user1->addProject($projectId);
		$user1->write();
		$project->addUser($user2Id, ProjectRoles::CONTRIBUTOR);
		$user2->addProject($projectId);
		$user2->write();
		$project->write();

		$dto = ProjectSettingsDto::encode($projectId, $user2Id);

		$this->assertEqual($dto['count'], 1);
		$this->assertIsA($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $user2Id);
		$this->assertEqual($dto['entries'][0]['name'], 'Name');
		$this->assertEqual($dto['entries'][0]['role'], ProjectRoles::CONTRIBUTOR);
		$this->assertIsA($dto['themeNames'], 'array');
		$this->assertEqual(count($dto['themeNames']), 2);
		$this->assertEqual($dto['themeNames'][0], 'default');
		$this->assertEqual($dto['themeNames'][1], 'jamaicanpsalms');
		$this->assertTrue(count($dto['rights']) > 0, "No rights in dto");
		$this->assertEqual($dto['bcs']['op'], 'settings');
		$this->assertEqual($dto['bcs']['project'], array('id' => $projectId, 'crumb' => SF_TESTPROJECT));
		$this->assertFalse(isset($dto['project']['users']));
		$this->assertEqual($dto['project']['id'], $projectId);
	}

}

?>
