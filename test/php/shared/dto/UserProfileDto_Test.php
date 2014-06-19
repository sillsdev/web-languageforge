<?php

use models\shared\dto\UserProfileDto;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SiteRoles;
use models\SfchecksUserProfile;
use models\UserProfileModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestUserProfileDto extends UnitTestCase {

	function testEncode_UserWithProfile_DtoCorrect() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("User", "Name", "name@example.com");
		$user = new UserProfileModel($userId);
		$user->role = SiteRoles::USER;

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$project->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$user->addProject($projectId);
		
		$projectUserProfile = new SfchecksUserProfile();
		$projectUserProfile->city = 'myCity';
		$user->projectUserProfiles[$projectId] = $projectUserProfile;
		
		$user->write();
		$project->write();
				
		$dto = UserProfileDto::encode($userId);
		
		$this->assertIsA($dto['userProfile'], 'array');
		$this->assertEqual($dto['userProfile']['id'], $userId);
		$this->assertEqual($dto['userProfile']['name'], 'Name');
		$this->assertEqual($dto['userProfile']['role'], SiteRoles::USER);
		$this->assertTrue(array_key_exists('avatar_shape', $dto['userProfile']));
		$this->assertTrue(array_key_exists('avatar_color', $dto['userProfile']));
		$this->assertEqual($dto['userProfile']['projectUserProfiles'][$projectId]['city'], 'myCity');
		$this->assertFalse(isset($dto['userProfile']['projects']));
		
		$this->assertIsA($dto['projectsSettings'], 'array');
		$this->assertEqual($dto['projectsSettings'][0]['id'], $projectId);
		$this->assertEqual($dto['projectsSettings'][0]['name'], SF_TESTPROJECT);
		$this->assertTrue(array_key_exists('city', $dto['projectsSettings'][0]['userProperties']['userProfilePickLists']));
		$this->assertTrue(array_key_exists('userProfilePropertiesEnabled', $dto['projectsSettings'][0]['userProperties']));
	}

}

?>
