<?php

use Api\Model\Shared\Dto\ProjectManagementDto;


use Api\Model\UserModel;
use Api\Model\Shared\Rights\ProjectRoles;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestProjectManagementDto extends UnitTestCase
{
    public function testEncode_ProjectWithUser_DtoCorrect()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE, 'sfchecks');
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
