<?php

use Api\Model\Shared\Dto\ProjectManagementDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ProjectManagementDtoTest extends TestCase
{
    public function testEncode_ProjectWithUser_DtoCorrect()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks');
        $project->ownerRef->id = $userId;
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $dto = ProjectManagementDto::encode($projectId);

        $this->assertTrue(count($dto['reports']) > 0);
        $foundUserEngagementReport = false;
        foreach ($dto['reports'] as $report) {
            if ($report['id'] == 'sfchecks_userEngagementReport') {
                $foundUserEngagementReport = true;
            }
        }
        $this->assertTrue($foundUserEngagementReport);
    }
}
