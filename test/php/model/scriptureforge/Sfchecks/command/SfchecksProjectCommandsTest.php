<?php

use Api\Model\Scriptureforge\Sfchecks\Command\SfchecksProjectCommands;
use Api\Model\Scriptureforge\Sfchecks\ProjectUserPropertiesSettings;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class SfchecksProjectCommandsTest extends TestCase
{
    public function testUpdateProject_ReadOnlyProperties_PropertiesNotChanged()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $hackerId = $environ->createUser('Hacker', 'Hacker', 'hacker@example.com');
        $hacker = new UserModel($hackerId);
        $hacker->role = SystemRoles::USER;
        $hacker->write();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

        SfchecksProjectCommands::updateProject($projectId, $userId, $params);

        $updatedProject = ProjectCommands::readProject($projectId);
        $this->assertEquals('new project name', $updatedProject['projectName']);
        $this->assertNotEquals($hackedData, $updatedProject['id']);
        $this->assertNotEquals($hacker->id->asString(), $updatedProject['ownerRef']);
        $this->assertFalse(isset($updatedProject['users'][$hacker->id->asString()]));
        $this->assertNotEquals($hackedData, $updatedProject['projectCode']);
        $this->assertNotEquals($hackedData, $updatedProject['siteName']);
        $this->assertNotEquals($hackedData, $updatedProject['appName']);
    }

    public function testUpdateProject_UserProperties_PropertiesChanged()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser('User', 'Name', 'name@example.com');
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $project->ownerRef = $user->id->asString();
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $newCity = 'Papakura';
        $params = ProjectCommands::readProject($projectId);
        $params['projectName'] = 'new project name';
        $params['userProperties']['userProfilePickLists']['city']['name'] = $newCity;
        $params['userProperties']['userProfilePropertiesEnabled'] = [ProjectUserPropertiesSettings::PROPERTY_CITY];

        SfchecksProjectCommands::updateProject($projectId, $userId, $params);

        $updatedProject = ProjectCommands::readProject($projectId);
        $this->assertEquals('new project name', $updatedProject['projectName']);
        $this->assertEquals($newCity, $updatedProject['userProperties']['userProfilePickLists']['city']['name']);
        $this->assertCount(1, $updatedProject['userProperties']['userProfilePropertiesEnabled']);
        $this->assertEquals(ProjectUserPropertiesSettings::PROPERTY_CITY, $updatedProject['userProperties']['userProfilePropertiesEnabled'][0]);
    }

}
