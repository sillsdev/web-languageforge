<?php

use Api\Model\Scriptureforge\Sfchecks\Dto\ProjectSettingsDto;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ProjectSettingsDtoTest extends TestCase
{
    public function testEncode_ProjectWith2Users1Unvalidated_DtoCorrect1User()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $user1Id = $environ->createUser('', '', '');
        $user1 = new UserModel($user1Id);
        $user1->role = SystemRoles::USER;

        $user2Id = $environ->createUser('User', 'Name', 'name@example.com');
        $user2 = new UserModel($user2Id);
        $user2->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($user1Id, ProjectRoles::CONTRIBUTOR);
        $user1->addProject($projectId);
        $user1->write();
        $project->addUser($user2Id, ProjectRoles::CONTRIBUTOR);
        $user2->addProject($projectId);
        $user2->write();
        $project->write();

        $text1 = new TextModel($project);
        $text1->title = 'Some Title';
        $text1->write();
        $text2 = new TextModel($project);
        $text2->title = 'Archived Title';
        $text2->isArchived = true;
        $text2->write();

        $dto = ProjectSettingsDto::encode($projectId, $user2Id);

        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $this->assertEquals($user2Id, $dto['entries'][1]['id']);
        $this->assertEquals('Name', $dto['entries'][1]['name']);
        $this->assertEquals(ProjectRoles::CONTRIBUTOR, $dto['entries'][1]['role']);
        $this->assertCount(1, $dto['archivedTexts']);
        $this->assertEquals('Archived Title', $dto['archivedTexts'][0]['title']);
        $this->assertTrue(count($dto['rights']) > 0, 'No rights in dto');
        $this->assertEquals('settings', $dto['bcs']['op']);
        $this->assertEquals(array('id' => $projectId, 'crumb' => SF_TESTPROJECT), $dto['bcs']['project']);
        $this->assertFalse(isset($dto['project']['users']));
        $this->assertEquals($projectId, $dto['project']['id']);
    }

}
