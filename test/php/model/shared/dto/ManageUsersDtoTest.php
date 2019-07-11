<?php

use Api\Model\Shared\Dto\ManageUsersDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ManageUsersDtoTest extends TestCase
{
    public function testEncode_ProjectWithUser_DtoCorrect()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = ManageUsersDto::encode($projectId);

        $this->assertEquals(1, $dto['userCount']);
        $this->assertIsArray($dto['users']);
        $this->assertEquals($userId, $dto['users'][0]['id']);
        $this->assertEquals('Name', $dto['users'][0]['name']);
        $this->assertEquals(ProjectRoles::CONTRIBUTOR, $dto['users'][0]['role']);
    }
}
