<?php

use Api\Model\Languageforge\Lexicon\Command\LexCommentCommands;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ActivityListDtoTest extends TestCase
{
    /** @throws Exception */
    public function testGetActivityForProject_DeletedUser_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = 'Text 1';
        $text->content = 'text content';
        $textId = $text->write();
        $userId = $environ->createUser('user1', 'user1', 'user1@email.com');
        ActivityCommands::addText($project, $textId, $text, $userId);
        ActivityCommands::addUserToProject($project, $userId);

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = 'the question';
        $question->description = 'question description';
        $question->textRef->id = $textId;
        $questionId = $question->write();
        ActivityCommands::addQuestion($project, $questionId, $question, $userId);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'first answer';
        $answer->score = 10;
        $answer->userRef->id = $userId;
        $answer->textHighlight = 'text highlight';
        $question->writeAnswer($answer);
        $activityId = ActivityCommands::addAnswer($project, $questionId, $answer);

        // now delete the user
        $user = new UserModel($userId);
        $user->remove();

        $dto = ActivityListDto::getActivityForProject($project);

        $expectedProjectRef = [
            'id' => $project->id->asString(),
            'type' => 'sfchecks'
        ];
        $this->assertEquals('add_answer', $dto[$activityId]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$activityId]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$activityId]['content']['project']);
        $this->assertEquals($textId, $dto[$activityId]['textRef']);
        $this->assertEquals($text->title, $dto[$activityId]['content']['text']);
        $this->assertEquals($questionId, $dto[$activityId]['questionRef']);
        $this->assertEquals($question->title, $dto[$activityId]['content']['question']);
        $this->assertEquals($answer->content, $dto[$activityId]['content']['answer']);
        $this->assertEquals('', $dto[$activityId]['userRef']);
        $this->assertEquals('user1', $dto[$activityId]['content']['user']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_MultipleProjects_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project1 = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project2 = $environ->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);

        $userId = $environ->createUser('user1', 'user1', 'user1@email.com');
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project1->write();

        $project2->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project2->write();

        $text1 = new TextModel($project1);
        $text1->title = 'Text 1';
        $text1->content = 'text content';
        $text1Id = $text1->write();
        $a1 = ActivityCommands::addText($project1, $text1Id, $text1, $userId);

        $text2 = new TextModel($project2);
        $text2->title = 'Text 2';
        $text2->content = 'text content';
        $text2Id = $text2->write();
        $a2 = ActivityCommands::addText($project2, $text2Id, $text2, $userId);

        $dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);
        $dto = $dto['activity'];

        $expectedProjectRef = [
            'id' => $project1->id->asString(),
            'type' => 'sfchecks'
        ];
        $this->assertEquals('add_text', $dto[$a1]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a1]['projectRef']);
        $this->assertEquals($project1->projectName, $dto[$a1]['content']['project']);
        $this->assertEquals($text1Id, $dto[$a1]['textRef']);
        $this->assertEquals($text1->title, $dto[$a1]['content']['text']);

        $expectedProjectRef['id'] = $project2->id->asString();
        $this->assertEquals('add_text', $dto[$a2]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a2]['projectRef']);
        $this->assertEquals($project2->projectName, $dto[$a2]['content']['project']);
        $this->assertEquals($text2Id, $dto[$a2]['textRef']);
        $this->assertEquals($text2->title, $dto[$a2]['content']['text']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_TwoProjectsTwoDomains_DtoHasOneProject()
    {
        $environ = new MongoTestEnvironment('scriptureforge.org');
        $environ->clean();

        $project1 = $environ->createProject(SF_TESTPROJECTCODE, SF_TESTPROJECTCODE);
        $project2 = $environ->createProject(SF_TESTPROJECTCODE2, SF_TESTPROJECTCODE2);
        $project2->siteName = 'languageforge.org';
        $project2->write();

        $userId = $environ->createUser('joe', 'joe', 'joe');

        $user = new UserModel($userId);
        $user->addProject($project1->id->asString());
        $user->addProject($project2->id->asString());
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project2->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->write();
        $project1->write();
        $project2->write();

        $text = new TextModel($project1);
        $text->title = 'Text 1';
        $text->content = 'text content';
        $textId = $text->write();
        $a1 = ActivityCommands::addText($project1, $textId, $text, $userId);

        $text = new TextModel($project2);
        $text->title = 'Text 2';
        $text->content = 'text content';
        $textId = $text->write();
        $a2 = ActivityCommands::addText($project2, $textId, $text, $userId);

        $dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);

        $this->assertArrayHasKey($a1, $dto['activity']);
        $this->assertArrayNotHasKey($a2, $dto['activity']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_TwoProjectsTwoDomains_UnreadHasOneProject()
    {
        $environ = new MongoTestEnvironment('scriptureforge.org');
        $environ->clean();

        $project1 = $environ->createProject(SF_TESTPROJECTCODE, SF_TESTPROJECTCODE);
        $project2 = $environ->createProject(SF_TESTPROJECTCODE2, SF_TESTPROJECTCODE2);
        $project2->siteName = 'languageforge.org';
        $project2->write();

        $userId = $environ->createUser('joe', 'joe', 'joe');

        $user = new UserModel($userId);
        $user->addProject($project1->id->asString());
        $user->addProject($project2->id->asString());
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project2->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->write();
        $project1->write();
        $project2->write();

        $text = new TextModel($project1);
        $text->title = 'Text 1';
        $text->content = 'text content';
        $textId = $text->write();
        ActivityCommands::addText($project1, $textId, $text, $userId);

        $text = new TextModel($project2);
        $text->title = 'Text 2';
        $text->content = 'text content';
        $textId = $text->write();
        ActivityCommands::addText($project2, $textId, $text, $userId);

        $dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);

        $this->assertCount(1, $dto['unread']);
    }

    /** @throws Exception */
    public function testGetActivityForProject_ProjectWithTextQuestionAnswerAndComments_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = 'Text 1';
        $text->content = 'text content';
        $textId = $text->write();
        $user1Id = $environ->createUser('user1', 'user1', 'user1@email.com');
        $user2Id = $environ->createUser('user2', 'user2', 'user2@email.com');
        $user3Id = $environ->createUser('user3', 'user3', 'user3@email.com');
        $a1 = ActivityCommands::addText($project, $textId, $text, $user1Id);
        $a2 = ActivityCommands::addUserToProject($project, $user1Id);
        $a3 = ActivityCommands::addUserToProject($project, $user2Id);
        $a4 = ActivityCommands::addUserToProject($project, $user3Id);

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = 'the question';
        $question->description = 'question description';
        $question->textRef->id = $textId;
        $questionId = $question->write();
        $a5 = ActivityCommands::addQuestion($project, $questionId, $question, $user1Id);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'first answer';
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->textHighlight = 'text highlight';
        $answerId = $question->writeAnswer($answer);
        $a6 = ActivityCommands::addAnswer($project, $questionId, $answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = 'first comment';
        $comment1->userRef->id = $user1Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);
        $a7 = ActivityCommands::addCommentOnQuestion($project, $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = 'second comment';
        $comment2->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);
        $a8 = ActivityCommands::addCommentOnQuestion($project, $questionId, $answerId, $comment2);

        // updated answer
        $question = new QuestionModel($project, $questionId);
        $answer_updated = $question->readAnswer($answerId);
        $answer_updated->content = 'first answer revised';
        $question->writeAnswer($answer_updated);
        $a9 = ActivityCommands::updateAnswer($project, $questionId, $answer_updated);

        // updated comment1
        $question = new QuestionModel($project, $questionId);
        $comment1_updated = $question->readComment($answerId, $comment1Id);
        $comment1_updated->content = 'first comment revised';
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1_updated);
        $a10 = ActivityCommands::updateCommentOnQuestion($project, $questionId, $answerId, $comment1_updated);

        $dto = ActivityListDto::getActivityForProject($project);

        $expectedProjectRef = [
            'id' => $project->id->asString(),
            'type' => 'sfchecks'
        ];
        $this->assertEquals('add_text', $dto[$a1]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a1]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a1]['content']['project']);
        $this->assertEquals($textId, $dto[$a1]['textRef']);
        $this->assertEquals($text->title, $dto[$a1]['content']['text']);

        $this->assertEquals('add_user_to_project', $dto[$a2]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a2]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a2]['content']['project']);
        $this->assertEquals($user1Id, $dto[$a2]['userRef']['id']);
        $this->assertEquals('user1', $dto[$a2]['userRef']['username']);
        $this->assertEquals('user1.png', $dto[$a2]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto[$a2]['content']['user']);

        $this->assertEquals('add_user_to_project', $dto[$a3]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a3]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a3]['content']['project']);
        $this->assertEquals($user2Id, $dto[$a3]['userRef']['id']);
        $this->assertEquals('user2', $dto[$a3]['userRef']['username']);
        $this->assertEquals('user2.png', $dto[$a3]['userRef']['avatar_ref']);
        $this->assertEquals('user2', $dto[$a3]['content']['user']);

        $this->assertEquals('add_user_to_project', $dto[$a4]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a4]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a4]['content']['project']);
        $this->assertEquals($user3Id, $dto[$a4]['userRef']['id']);
        $this->assertEquals('user3', $dto[$a4]['userRef']['username']);
        $this->assertEquals('user3.png', $dto[$a4]['userRef']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a4]['content']['user']);

        $this->assertEquals('add_question', $dto[$a5]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a5]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a5]['content']['project']);
        $this->assertEquals($textId, $dto[$a5]['textRef']);
        $this->assertEquals($text->title, $dto[$a5]['content']['text']);
        $this->assertEquals($questionId, $dto[$a5]['questionRef']);
        $this->assertEquals($question->title, $dto[$a5]['content']['question']);

        $this->assertEquals('add_answer', $dto[$a6]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a6]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a6]['content']['project']);
        $this->assertEquals($textId, $dto[$a6]['textRef']);
        $this->assertEquals($text->title, $dto[$a6]['content']['text']);
        $this->assertEquals($questionId, $dto[$a6]['questionRef']);
        $this->assertEquals($question->title, $dto[$a6]['content']['question']);
        $this->assertEquals($user3Id, $dto[$a6]['userRef']['id']);
        $this->assertEquals('user3', $dto[$a6]['userRef']['username']);
        $this->assertEquals('user3.png', $dto[$a6]['userRef']['avatar_ref']);
        $this->assertEquals($answer->content, $dto[$a6]['content']['answer']);
        $this->assertEquals('user3', $dto[$a6]['content']['user']);

        $this->assertEquals('add_comment', $dto[$a7]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a7]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a7]['content']['project']);
        $this->assertEquals($textId, $dto[$a7]['textRef']);
        $this->assertEquals($text->title, $dto[$a7]['content']['text']);
        $this->assertEquals($questionId, $dto[$a7]['questionRef']);
        $this->assertEquals($question->title, $dto[$a7]['content']['question']);
        $this->assertEquals($user1Id, $dto[$a7]['userRef']['id']);
        $this->assertEquals('user1', $dto[$a7]['userRef']['username']);
        $this->assertEquals('user1.png', $dto[$a7]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto[$a7]['content']['user']);
        $this->assertEquals($user3Id, $dto[$a7]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto[$a7]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto[$a7]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a7]['content']['userRelated']);
        $this->assertEquals($answer->content, $dto[$a7]['content']['answer']);
        $this->assertEquals($comment1->content, $dto[$a7]['content']['comment']);

        $this->assertEquals('add_comment', $dto[$a8]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a8]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a8]['content']['project']);
        $this->assertEquals($textId, $dto[$a8]['textRef']);
        $this->assertEquals($text->title, $dto[$a8]['content']['text']);
        $this->assertEquals($questionId, $dto[$a8]['questionRef']);
        $this->assertEquals($question->title, $dto[$a8]['content']['question']);
        $this->assertEquals($user2Id, $dto[$a8]['userRef']['id']);
        $this->assertEquals('user2', $dto[$a8]['userRef']['username']);
        $this->assertEquals('user2.png', $dto[$a8]['userRef']['avatar_ref']);
        $this->assertEquals('user2', $dto[$a8]['content']['user']);
        $this->assertEquals($user3Id, $dto[$a8]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto[$a8]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto[$a8]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a8]['content']['userRelated']);
        $this->assertEquals($answer->content, $dto[$a8]['content']['answer']);
        $this->assertEquals($comment2->content, $dto[$a8]['content']['comment']);

        $this->assertEquals('update_answer', $dto[$a9]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a9]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a9]['content']['project']);
        $this->assertEquals($textId, $dto[$a9]['textRef']);
        $this->assertEquals($text->title, $dto[$a9]['content']['text']);
        $this->assertEquals($questionId, $dto[$a9]['questionRef']);
        $this->assertEquals($question->title, $dto[$a9]['content']['question']);
        $this->assertEquals($user3Id, $dto[$a9]['userRef']['id']);
        $this->assertEquals('user3', $dto[$a9]['userRef']['username']);
        $this->assertEquals('user3.png', $dto[$a9]['userRef']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a9]['content']['user']);
        $this->assertEquals($answer_updated->content, $dto[$a9]['content']['answer']);

        $this->assertEquals('update_comment', $dto[$a10]['action']);
        $this->assertEquals($expectedProjectRef, $dto[$a10]['projectRef']);
        $this->assertEquals($project->projectName, $dto[$a10]['content']['project']);
        $this->assertEquals($textId, $dto[$a10]['textRef']);
        $this->assertEquals($text->title, $dto[$a10]['content']['text']);
        $this->assertEquals($questionId, $dto[$a10]['questionRef']);
        $this->assertEquals($question->title, $dto[$a10]['content']['question']);
        $this->assertEquals($user1Id, $dto[$a10]['userRef']['id']);
        $this->assertEquals('user1', $dto[$a10]['userRef']['username']);
        $this->assertEquals('user1.png', $dto[$a10]['userRef']['avatar_ref']);
        $this->assertEquals('user1', $dto[$a10]['content']['user']);
        $this->assertEquals($user3Id, $dto[$a10]['userRefRelated']['id']);
        $this->assertEquals('user3', $dto[$a10]['userRefRelated']['username']);
        $this->assertEquals('user3.png', $dto[$a10]['userRefRelated']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a10]['content']['userRelated']);
        $this->assertEquals($answer_updated->content, $dto[$a10]['content']['answer']);
        $this->assertEquals($comment1_updated->content, $dto[$a10]['content']['comment']);
    }

    // Tests for Language Forge-specific activities

    /** @throws Exception */
    public function testGetActivityForUser_UpdateEntry_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'][0]['sentence']['en']['value'] = 'also eat an apple';
        $params['senses'][1]['examples'] = [];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord['action']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $content = $activityRecord['content'];
        $this->assertEquals(SF_TESTPROJECT, $content['project']);
        $this->assertEquals('apple', $content['entry']);
        $this->assertEquals('user1', $content['user']);  // TODO: Shouldn't this be "User One" instead? E.g., human-readable name here rather than username? (Same comment applies in all parts of other tests where we check $content['user']). - 2018-06 RM
        $this->assertArrayHasKey('changes', $content);
        $changes = $content['changes'];
        $this->assertCount(3, $changes);

        $this->assertContains([
            'changeType' => ActivityListDto::EDITED_FIELD,
            'fieldName' => LexConfig::EXAMPLE_SENTENCE,
            'fieldLabel' => ['label' => 'Sentence', 'sense' => 1, 'example' => 1],
            'inputSystemTag' => 'en',
            'oldValue' => 'eat an apple',
            'newValue' => 'also eat an apple',
        ], $changes);

        $this->assertContains([
            'changeType' => ActivityListDto::EDITED_FIELD,  // TODO: Should this become "deleted_field" instead?
            'fieldName' => LexConfig::EXAMPLE_SENTENCE,
            'fieldLabel' => ['label' => 'Sentence', 'sense' => 2, 'example' => 1],
            'inputSystemTag' => 'fr',
            'oldValue' => 'manger une pomme',
            'newValue' => '',
        ], $changes);

        $this->assertContains([
            'changeType' => ActivityListDto::DELETED_FIELD,
            'fieldName' => LexConfig::EXAMPLES_LIST,
            'fieldLabel' => ['label' => 'Example', 'sense' => 2, 'example' => 1],
            'oldValue' => '',
            'newValue' => '',
        ], $changes);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddExample_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $entryId = $entry->write();

        $example2Guid = \Api\Model\Languageforge\Lexicon\Guid::create();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][1]['examples'] = [
            [
                'guid' => $example2Guid,
                'sentence' => ['fr' => ['value' => 'manger une pomme']]
            ]
        ];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord['action']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $content = $activityRecord['content'];
        $this->assertEquals(SF_TESTPROJECT, $content['project']);
        $this->assertEquals('apple', $content['entry']);
        $this->assertEquals('user1', $content['user']);
        $this->assertArrayHasKey('changes', $content);
        $changes = $content['changes'];
        $this->assertCount(2, $changes);
        $change = $changes[0];

        $this->assertEquals(ActivityListDto::ADDED_FIELD, $change['changeType']);
        $this->assertEquals(LexConfig::EXAMPLES_LIST, $change['fieldName']);
        $this->assertEquals(['label' => 'Example', 'sense' => 2, 'example' => 1], $change['fieldLabel']);
        // Adding a whole example doesn't store its contents in the activity log
        // TODO: Decide whether it should do so
        $this->assertArrayNotHasKey('inputSystemTag', $change);
        $this->assertEquals('', $change['oldValue']);
        $this->assertEquals('', $change['newValue']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddExampleSentence_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][1]['examples'] = [
            [
                'guid' => $example2->guid,
                'sentence' => ['fr' => ['value' => 'manger une pomme']]
            ]
        ];

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        $this->assertEquals(ActivityModel::UPDATE_ENTRY, $activityRecord['action']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $content = $activityRecord['content'];
        $this->assertEquals(SF_TESTPROJECT, $content['project']);
        $this->assertEquals('apple', $content['entry']);
        $this->assertEquals('user1', $content['user']);
        $this->assertArrayHasKey('changes', $content);
        $changes = $content['changes'];
        $this->assertCount(1, $changes);
        $change = $changes[0];

        $this->assertEquals(ActivityListDto::EDITED_FIELD, $change['changeType']);
        $this->assertEquals(LexConfig::EXAMPLE_SENTENCE, $change['fieldName']);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $change['fieldLabel']);
        // Adding a single MultiText field in an example does store its contents in the activity log
        // TODO: Decide whether it should do so
        $this->assertEquals('fr', $change['inputSystemTag']);
        $this->assertEquals('', $change['oldValue']);
        $this->assertEquals('manger une pomme', $change['newValue']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(1, $activity);
        $activityRecord = array_shift($activity);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        $this->assertEquals(ActivityModel::ADD_LEX_COMMENT, $activityRecord['action']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_PlusOneEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);
        LexCommentCommands::plusOneComment($projectId, $userId, $commentId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(2, $activity);
        // We're only interested in the LEX_COMMENT_INCREASE_SCORE activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::LEX_COMMENT_INCREASE_SCORE) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::LEX_COMMENT_INCREASE_SCORE, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_UpdateEntryCommentStatus_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);

        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);
        LexCommentCommands::updateCommentStatus($projectId, $commentId, LexCommentModel::STATUS_TODO);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(2, $activity);
        // We're only interested in the UPDATE_LEX_COMMENT_STATUS activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::UPDATE_LEX_COMMENT_STATUS) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::UPDATE_LEX_COMMENT_STATUS, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals(LexCommentModel::STATUS_TODO, $actual[ActivityModel::LEX_COMMENT_STATUS]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_DeleteEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);
        LexCommentCommands::deleteComment($projectId, $userId, $environ->website, $commentId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(2, $activity);
        // We're only interested in the DELETE_LEX_COMMENT activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::DELETE_LEX_COMMENT) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::DELETE_LEX_COMMENT, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_AddReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);

        $replyData = [
            'id' => '',
            'content' => 'my first reply'
        ];
        LexCommentCommands::updateReply($projectId, $userId, $environ->website, $commentId, $replyData);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(2, $activity);
        // We're only interested in the ADD_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::ADD_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::ADD_LEX_REPLY, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $expected['replyContent'] = $replyData['content'];
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['replyContent'], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_UpdateReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);

        $replyData = [
            'id' => '',
            'content' => 'my first reply'
        ];
        $replyId = LexCommentCommands::updateReply($projectId, $userId, $environ->website, $commentId, $replyData);

        $updatedReplyData = [
            'id' => $replyId,
            'content' => 'edited the first reply'
        ];
        $updatedReplyId = LexCommentCommands::updateReply($projectId, $userId, $environ->website, $commentId, $updatedReplyData);
        $this->assertEquals($replyId, $updatedReplyId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(3, $activity);
        // We're only interested in the UPDATE_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::UPDATE_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::UPDATE_LEX_REPLY, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $expected['replyContent'] = $updatedReplyData['content'];
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['replyContent'], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

    /** @throws Exception */
    public function testGetActivityForUser_DeleteReplyToEntryComment_DtoAsExpected()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->assertEquals($project->appName, LfProjectModel::LEXICON_APP);


        $userId = $environ->createUser('user1', 'User One', 'user1@email.com');
        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('en', 'bank');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'the sides of a river');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'a place to store money');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'money in the bank');
        $sense2->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('en', 'a run on the bank');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $regarding = [
            'field' => 'sentence',
            'fieldNameForDisplay' => 'Sentence',
            'fieldValue' => 'a run on the bank',
            'inputSystem' => 'en',
            'word' => 'bank',
            'meaning' => 'a place to store money'
        ];
        $data = [
            'id' => '',
            'entryRef' => $entryId,
            'content' => 'Comment on the sentence',
            'regarding' => $regarding,
            'contextGuid' => ' sense#' . $sense2->guid . ' example#' . $example1->guid . ' sentence.en',
            'isRegardingPicture' => false
        ];
        $commentId = LexCommentCommands::updateComment($projectId, $userId, $environ->website, $data);

        $replyData = [
            'id' => '',
            'content' => 'my first reply'
        ];
        $replyId = LexCommentCommands::updateReply($projectId, $userId, $environ->website, $commentId, $replyData);
        LexCommentCommands::deleteReply($projectId, $userId, $environ->website, $commentId, $replyId);

        $dto = ActivityListDto::getActivityForUser($project->siteName, $userId);
        $activity = $dto['activity'];
        $this->assertCount(3, $activity);
        // We're only interested in the DELETE_LEX_REPLY activity for this test
        $activityRecord = array_shift($activity);
        while ($activityRecord != null && $activityRecord['action'] != ActivityModel::DELETE_LEX_REPLY) {
            $activityRecord = array_shift($activity);
        }
        $this->assertNotNull($activityRecord);
        $this->assertEquals(ActivityModel::DELETE_LEX_REPLY, $activityRecord['action']);
        $this->assertEquals($projectId, $activityRecord['projectRef']['id']);
        $this->assertEquals(LfProjectModel::LEXICON_APP, $activityRecord['projectRef']['type']);
        $this->assertEquals($entryId, $activityRecord['entryRef']);
        // "Content" field should contain human-readable strings for use in activity log
        $this->assertArrayHasKey('content', $activityRecord);
        $actual = $activityRecord['content'];
        $expected = $data;
        $expected['replyContent'] = $replyData['content'];
        $this->assertEquals(SF_TESTPROJECT, $actual['project']);
        $this->assertEquals('user1', $actual['user']);
        $this->assertEquals($expected['content'], $actual[ActivityModel::LEX_COMMENT]);
        $this->assertEquals($expected['replyContent'], $actual[ActivityModel::LEX_REPLY]);
        $this->assertEquals($expected['contextGuid'], $actual[ActivityModel::LEX_COMMENT_CONTEXT]);
        $this->assertEquals($expected['regarding']['fieldValue'], $actual[ActivityModel::LEX_COMMENT_FIELD_VALUE]);
        $this->assertEquals(['label' => 'Sentence', 'sense' => 2, 'example' => 1], $actual['fieldLabel']);
    }

}
