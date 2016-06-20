<?php

use Api\Model\Scriptureforge\Dto\TextSettingsDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\QuestionModel;
use Api\Model\TextModel;
use Api\Model\UserModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestTextSettingsDto extends UnitTestCase
{
    public function testEncode_2Questions1Archived_DtoCorrect1ArchivedQuestion()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

        $this->assertIsA($dto['text'], 'array');
        $this->assertEqual($dto['text']['id'], $textId);
        $this->assertEqual($dto['text']['title'], 'Text Title');
        $this->assertIsA($dto['archivedQuestions'], 'array');
        $this->assertEqual(count($dto['archivedQuestions']), 1);
        $this->assertEqual($dto['archivedQuestions'][0]['title'], 'Archived Title');
        $this->assertTrue(count($dto['rights']) > 0, "No rights in dto");
        $this->assertEqual($dto['bcs']['op'], 'settings');
        $this->assertEqual($dto['bcs']['project'], array('id' => $projectId, 'crumb' => SF_TESTPROJECT));
    }

}
