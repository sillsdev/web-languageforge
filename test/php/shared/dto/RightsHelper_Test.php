<?php

use Api\Model\ProjectModel;

use Api\Model\Shared\Dto\RightsHelper;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestRightsHelper extends UnitTestCase
{

    public function __construct() {
        $this->environ = new MongoTestEnvironment();
        $this->environ->clean();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var MongoTestEnvironment
     */
    private $environ;

    /**
     * Cleanup test environment
     */
    public function tearDown()
    {
        $this->environ->clean();
    }

    public function testuserCanAccessMethod_unknownMethodName_Exception()
    {
        $userId = $this->environ->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $rh = new RightsHelper($userId, null, $this->environ->website);

        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        $rh->userCanAccessMethod('bogusMethodName', array());

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testuserCanAccessMethod_unknownMethodName_Exception
    public function testuserCanAccessMethod_unknownMethodName_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testUserCanAccessMethod_projectSettings_projectManager_true()
    {
        $userId = $this->environ->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $user = new UserModel($userId);
        $project = $this->environ->createProject('projectForTest', 'projTestCode');
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->appName = 'sfchecks';
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $this->environ->website);
        $result = $rh->userCanAccessMethod('project_settings', array());
        $this->assertTrue($result);
    }

    public function testUserCanAccessMethod_projectSettings_projectMember_false()
    {
        $userId = $this->environ->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $user = new UserModel($userId);
        $project = $this->environ->createProject('projectForTest', 'projTestCode');
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->appName = 'sfchecks';
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $this->environ->website);
        $result = $rh->userCanAccessMethod('project_settings', array());
        $this->assertFalse($result);
    }

    public function testUserCanAccessMethod_projectPageDto_NotAMember_false()
    {
        $userId = $this->environ->createUser('user', 'user', 'user@user.com', SystemRoles::USER);
        $project = $this->environ->createProject('projectForTest', 'projTestCode');
        $project->appName = 'sfchecks';
        $project->write();
        $projectId = $project->id->asString();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project, $this->environ->website);
        $result = $rh->userCanAccessMethod('project_pageDto', array());
        $this->assertFalse($result);
    }
}
