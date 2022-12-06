<?php

use Api\Model\Shared\Dto\RightsHelper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class RightsHelperTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    /**
     * Cleanup test environment
     */
    public function tearDown(): void
    {
        self::$environ->clean();
    }

    public function testuserCanAccessMethod_unknownMethodName_Exception()
    {
        $this->expectException(Exception::class);

        $userId = self::$environ->createUser("user", "user", "user@user.com", SystemRoles::USER);
        $rh = new RightsHelper($userId, null);

        $rh->userCanAccessMethod("bogusMethodName", []);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testUserCanAccessMethod_projectSettings_projectManager_true()
    {
        $userId = self::$environ->createUser("user", "user", "user@user.com", SystemRoles::USER);
        $user = new UserModel($userId);
        $project = self::$environ->createProject("projectForTest", "projTestCode");
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->appName = "lexicon";
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project);
        $result = $rh->userCanAccessMethod("project_settings", []);
        $this->assertTrue($result);
    }

    public function testUserCanAccessMethod_projectSettings_projectMember_false()
    {
        $userId = self::$environ->createUser("user", "user", "user@user.com", SystemRoles::USER);
        $user = new UserModel($userId);
        $project = self::$environ->createProject("projectForTest", "projTestCode");
        $projectId = $project->id->asString();
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->appName = "lexicon";
        $project->write();
        $user->addProject($projectId);
        $user->write();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project);
        $result = $rh->userCanAccessMethod("project_settings", []);
        $this->assertFalse($result);
    }

    public function testUserCanAccessMethod_projectPageDto_NotAMember_false()
    {
        $userId = self::$environ->createUser("user", "user", "user@user.com", SystemRoles::USER);
        $project = self::$environ->createProject("projectForTest", "projTestCode");
        $project->appName = "lexicon";
        $project->write();
        $projectId = $project->id->asString();
        $project = ProjectModel::getById($projectId);
        $rh = new RightsHelper($userId, $project);
        $result = $rh->userCanAccessMethod("project_pageDto", []);
        $this->assertFalse($result);
    }
}
