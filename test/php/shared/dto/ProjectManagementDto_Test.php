<?php

use models\shared\dto\ProjectManagementDto;


use models\UserModel;
use models\shared\rights\ProjectRoles;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

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
