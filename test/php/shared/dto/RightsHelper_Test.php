<?php

use models\ProjectModel;

use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
use models\shared\rights\SystemRoles;
use models\UserModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestRightsHelper extends UnitTestCase
{
    public function testuserCanAccessMethod_unknownMethodName_throws()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $rh = new RightsHelper($userId, null, $e->website);

        $e->inhibitErrorDisplay();
        $this->expectException();
        $result = $rh->userCanAccessMethod($userId, 'bogusMethodName', array());
        $e->restoreErrorDisplay();
    }

    public function testUserCanAccessMethod_projectSettings_projectManager_true()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $user = new UserModel($userId);
        $project = $e->createProject('projectForTest', 'projTestCode');
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->appName = 'sfchecks';
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $e->website);
        $result = $rh->userCanAccessMethod('project_settings', array());
        $this->assertTrue($result);
    }

    public function testUserCanAccessMethod_projectSettings_projectMember_false()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $user = new UserModel($userId);
        $project = $e->createProject('projectForTest', 'projTestCode');
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->appName = 'sfchecks';
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $e->website);
        $result = $rh->userCanAccessMethod('project_settings', array());
        $this->assertFalse($result);
    }

    public function testUserCanAccessMethod_projectPageDto_NotAMember_false()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $userId = $e->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $project = $e->createProject('projectForTest', 'projTestCode');
        $project->appName = 'sfchecks';
        $project->write();
        $projectId = $project->id->asString();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $e->website);
        $result = $rh->userCanAccessMethod('project_pageDto', array());
        $this->assertFalse($result);
    }
}
