<?php

use Api\Model\Scriptureforge\Sfchecks\SfchecksUserProfile;
use Api\Model\Shared\Dto\UserProfileDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SiteRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class UserProfileDtoTest extends TestCase
{
    public function testEncode_UserProjectHasUserProfileProperties_ReturnsProjectProperties()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SiteRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);

        // enable one user profile property
        $project->userProperties->userProfilePropertiesEnabled->append('city');

        $projectUserProfile = new SfchecksUserProfile();
        $projectUserProfile->city = 'myCity';
        $user->projectUserProfiles[$projectId] = $projectUserProfile;

        $user->write();
        $project->write();

        $dto = UserProfileDto::encode($userId, $environ->website);

        $this->assertIsArray($dto['userProfile']);
        $this->assertEquals($userId, $dto['userProfile']['id']);
        $this->assertEquals('Name', $dto['userProfile']['name']);
        $this->assertEquals(SiteRoles::USER, $dto['userProfile']['role']);
        $this->assertArrayHasKey('avatar_shape', $dto['userProfile']);
        $this->assertArrayHasKey('avatar_color', $dto['userProfile']);
        $this->assertEquals('myCity', $dto['userProfile']['projectUserProfiles'][$projectId]['city']);
        $this->assertFalse(isset($dto['userProfile']['projects']));

        $this->assertIsArray($dto['projectsSettings']);
        $this->assertEquals($projectId, $dto['projectsSettings'][0]['id']);
        $this->assertEquals(SF_TESTPROJECT, $dto['projectsSettings'][0]['name']);
        $this->assertArrayHasKey('city', $dto['projectsSettings'][0]['userProperties']['userProfilePickLists']);
        $this->assertArrayHasKey('userProfilePropertiesEnabled', $dto['projectsSettings'][0]['userProperties']);
    }

    public function testEncode_userProjectHasNoUserProfileProperties_noProjectSettings()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SiteRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);

        // user profile has data; but the encode method ignores it because the project has not enabled the 'city' property
        $projectUserProfile = new SfchecksUserProfile();
        $projectUserProfile->city = 'myCity';
        $user->projectUserProfiles[$projectId] = $projectUserProfile;

        $user->write();
        $project->write();

        $dto = UserProfileDto::encode($userId, $environ->website);

        $this->assertIsArray($dto['userProfile']);
        $this->assertEquals($userId, $dto['userProfile']['id']);
        $this->assertEquals('Name', $dto['userProfile']['name']);
        $this->assertEquals(SiteRoles::USER, $dto['userProfile']['role']);
        $this->assertArrayHasKey('avatar_shape', $dto['userProfile']);
        $this->assertArrayHasKey('avatar_color', $dto['userProfile']);
        $this->assertFalse(isset($dto['userProfile']['projects']));

        $this->assertIsArray($dto['projectsSettings']);
        $this->assertEquals(0, count($dto['projectsSettings']));
    }
}
