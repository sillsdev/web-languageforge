<?php

use Api\Model\Shared\Rights\SystemRoles;

use Api\Model\Shared\Dto\ManageUsersDto;
use Api\Model\UserModel;
use Api\Model\Shared\Rights\ProjectRoles;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestManageUsersDto extends UnitTestCase
{
    public function testEncode_ProjectWithUser_DtoCorrect()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = ManageUsersDto::encode($projectId);

        $this->assertEqual($dto['userCount'], 1);
        $this->assertIsA($dto['users'], 'array');
        $this->assertEqual($dto['users'][0]['id'], $userId);
        $this->assertEqual($dto['users'][0]['name'], 'Name');
        $this->assertEqual($dto['users'][0]['role'], ProjectRoles::CONTRIBUTOR);
    }

}
