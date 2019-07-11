<?php

use Api\Model\Scriptureforge\Sfchecks\Dto\TextSettingsDto;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class TextSettingsDtoTest extends TestCase
{
    public function testEncode_2Questions1Archived_DtoCorrect1ArchivedQuestion()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::MANAGER);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $text = new TextModel($project);
        $text->title = "Text Title";
        $textId = $text->write();

        $question1 = new QuestionModel($project);
        $question1->title = "Some Title";
        $question1->textRef->id = $textId;
        $question1->write();
        $question2 = new QuestionModel($project);
        $question2->title = "Archived Title";
        $question2->textRef->id = $textId;
        $question2->isArchived = true;
        $question2->write();

        $dto = TextSettingsDto::encode($projectId, $textId, $userId);

        $this->assertIsArray($dto['text']);
        $this->assertEquals($textId, $dto['text']['id']);
        $this->assertEquals('Text Title', $dto['text']['title']);
        $this->assertIsArray($dto['archivedQuestions']);
        $this->assertCount(1, $dto['archivedQuestions']);
        $this->assertEquals('Archived Title', $dto['archivedQuestions'][0]['title']);
        $this->assertTrue(count($dto['rights']) > 0, "No rights in dto");
        $this->assertEquals('settings', $dto['bcs']['op']);
        $this->assertEquals(array('id' => $projectId, 'crumb' => SF_TESTPROJECT), $dto['bcs']['project']);
    }

}
