<?php

use models\ProjectModel;

use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SiteRoles;
use models\commands\ProjectCommands;
use models\UserModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestRightsHelper extends UnitTestCase {

	function testuserCanAccessMethod_unknownMethodName_throws() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId = $e->createUser('user', 'user', 'user@user.com', SiteRoles::USER);
		$rh = new RightsHelper($userId, null);
		
		$e->inhibitErrorDisplay();
		$this->expectException();
		$result = $rh->userCanAccessMethod($userId, 'bogusMethodName', array());
		$e->restoreErrorDisplay();
	}

	function testUserCanAccessMethod_projectSettings_projectManager_true() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId = $e->createUser('user', 'user', 'user@user.com', SiteRoles::USER);
		$user = new UserModel($userId);
		$project = $e->createProject('projectForTest');
		$projectId = $project->id->asString();
		$project->addUser($userId, ProjectRoles::MANAGER);
		$project->appName = 'sfchecks';
		$project->write();
		$user->addProject($projectId);
		$user->write();
		$project = ProjectModel::getById($projectId);
		$rh = new RightsHelper($userId, $project);
		$result = $rh->userCanAccessMethod('project_settings', array());
		$this->assertTrue($result);
	}

	function testUserCanAccessMethod_projectSettings_projectMember_false() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId = $e->createUser('user', 'user', 'user@user.com', SiteRoles::USER);
		$user = new UserModel($userId);
		$project = $e->createProject('projectForTest');
		$projectId = $project->id->asString();
		$project->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$project->appName = 'sfchecks';
		$project->write();
		$user->addProject($projectId);
		$user->write();
		$project = ProjectModel::getById($projectId);
		$rh = new RightsHelper($userId, $project);
		$result = $rh->userCanAccessMethod('project_settings', array());
		$this->assertFalse($result);
	}
	
	function testUserCanAccessMethod_projectPageDto_NotAMember_false() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$userId = $e->createUser('user', 'user', 'user@user.com', SiteRoles::USER);
		$project = $e->createProject('projectForTest');
		$project->appName = 'sfchecks';
		$project->write();
		$projectId = $project->id->asString();
		$project = ProjectModel::getById($projectId);
		$rh = new RightsHelper($userId, $project);
		$result = $rh->userCanAccessMethod('project_pageDto', array());
		$this->assertFalse($result);
	}
}
