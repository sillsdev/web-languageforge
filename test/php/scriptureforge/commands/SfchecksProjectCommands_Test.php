<?php

use Api\Model\Scriptureforge\Sfchecks\Command\SfchecksProjectCommands;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestSfchecksProjectCommands extends UnitTestCase
{
    public function testUpdateProject_ReadOnlyProperties_PropertiesNotChanged()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $hackerId = $e->createUser("Hacker", "Hacker", "hacker@example.com");
        $hacker = new UserModel($hackerId);
        $hacker->role = SystemRoles::USER;
        $hacker->write();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->ownerRef = $user->id->asString();
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $hackedData = 'hacked';
        $params = ProjectCommands::readProject($projectId);
        $params['projectName'] = 'new project name';
        $params['id'] = $hackedData;
        $params['ownerRef'] = $hacker->id->asString();
        $params['users'][$hacker->id->asString()]['role'] = ProjectRoles::MANAGER;
        $params['projectCode'] = $hackedData;
        $params['siteName'] = $hackedData;
        $params['appName'] = $hackedData;
        $params['userProperties']['userProfilePickLists']['city']['name'] = $hackedData;
        SfchecksProjectCommands::updateProject($projectId, $userId, $params);

        $updatedProject = ProjectCommands::readProject($projectId);
        $this->assertEqual($updatedProject['projectName'], 'new project name');
        $this->assertNotEqual($updatedProject['id'], $hackedData);
        $this->assertNotEqual($updatedProject['ownerRef'], $hacker->id->asString());
        $this->assertFalse(isset($updatedProject['users'][$hacker->id->asString()]));
        $this->assertNotEqual($updatedProject['projectCode'], $hackedData);
        $this->assertNotEqual($updatedProject['siteName'], $hackedData);
        $this->assertNotEqual($updatedProject['appName'], $hackedData);
        $this->assertNotEqual($updatedProject['userProperties']['userProfilePickLists']['city']['name'], $hackedData);
    }
}
