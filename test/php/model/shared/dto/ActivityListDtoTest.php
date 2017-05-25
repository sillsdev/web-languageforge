<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class ActivityListDtoTest extends TestCase
{
    public function testGetActivityForProject_DeletedUser_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $text->content = "text content";
        $textId = $text->write();
        ActivityCommands::addText($project, $textId, $text);

        $userId = $environ->createUser("user1", "user1", "user1@email.com");
        ActivityCommands::addUserToProject($project, $userId);

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();
        ActivityCommands::addQuestion($project, $questionId, $question);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $userId;
        $answer->textHightlight = "text highlight";
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

    public function testGetActivityForUser_MultipleProjects_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project1 = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project2 = $environ->createProject(SF_TESTPROJECT2, SF_TESTPROJECTCODE2);

        $userId = $environ->createUser("user1", "user1", "user1@email.com");
        $project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project1->write();

        $project2->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $project2->write();

        $text1 = new TextModel($project1);
        $text1->title = "Text 1";
        $text1->content = "text content";
        $text1Id = $text1->write();
        $a1 = ActivityCommands::addText($project1, $text1Id, $text1);

        $text2 = new TextModel($project2);
        $text2->title = "Text 2";
        $text2->content = "text content";
        $text2Id = $text2->write();
        $a2 = ActivityCommands::addText($project2, $text2Id, $text2);

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

        $environ->clean();
    }
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
        $text->title = "Text 1";
        $text->content = "text content";
        $textId = $text->write();
        $a1 = ActivityCommands::addText($project1, $textId, $text);

        $text = new TextModel($project2);
        $text->title = "Text 2";
        $text->content = "text content";
        $textId = $text->write();
        $a2 = ActivityCommands::addText($project2, $textId, $text);

        $dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);

        $this->assertArrayHasKey($a1, $dto['activity']);
        $this->assertArrayNotHasKey($a2, $dto['activity']);
    }

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
        $text->title = "Text 1";
        $text->content = "text content";
        $textId = $text->write();
        ActivityCommands::addText($project1, $textId, $text);

        $text = new TextModel($project2);
        $text->title = "Text 2";
        $text->content = "text content";
        $textId = $text->write();
        ActivityCommands::addText($project2, $textId, $text);

        $dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);

        $this->assertEquals(1, count($dto['unread']));
    }

    public function testGetActivityForProject_ProjectWithTextQuestionAnswerAndComments_DtoAsExpected()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $text->content = "text content";
        $textId = $text->write();
        $a1 = ActivityCommands::addText($project, $textId, $text);

        $user1Id = $environ->createUser("user1", "user1", "user1@email.com");
        $user2Id = $environ->createUser("user2", "user2", "user2@email.com");
        $user3Id = $environ->createUser("user3", "user3", "user3@email.com");
        $a2 = ActivityCommands::addUserToProject($project, $user1Id);
        $a3 = ActivityCommands::addUserToProject($project, $user2Id);
        $a4 = ActivityCommands::addUserToProject($project, $user3Id);

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();
        $a5 = ActivityCommands::addQuestion($project, $questionId, $question);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->textHightlight = "text highlight";
        $answerId = $question->writeAnswer($answer);
        $a6 = ActivityCommands::addAnswer($project, $questionId, $answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = "first comment";
        $comment1->userRef->id = $user1Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);
        $a7 = ActivityCommands::addComment($project, $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = "second comment";
        $comment2->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);
        $a8 = ActivityCommands::addComment($project, $questionId, $answerId, $comment2);

        // updated answer
        $question->read($questionId);
        $answer_updated = $question->readAnswer($answerId);
        $answer_updated->content = "first answer revised";
        $question->writeAnswer($answer_updated);
        $a9 = ActivityCommands::updateAnswer($project, $questionId, $answer_updated);

        // updated comment1
        $question->read($questionId);
        $comment1_updated = $question->readComment($answerId, $comment1Id);
        $comment1_updated->content = "first comment revised";
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1_updated);
        $a10 = ActivityCommands::updateComment($project, $questionId, $answerId, $comment1_updated);

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
        $this->assertEquals($user3Id, $dto[$a7]['userRef2']['id']);
        $this->assertEquals('user3', $dto[$a7]['userRef2']['username']);
        $this->assertEquals('user3.png', $dto[$a7]['userRef2']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a7]['content']['user2']);
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
        $this->assertEquals($user3Id, $dto[$a8]['userRef2']['id']);
        $this->assertEquals('user3', $dto[$a8]['userRef2']['username']);
        $this->assertEquals('user3.png', $dto[$a8]['userRef2']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a8]['content']['user2']);
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
        $this->assertEquals($user3Id, $dto[$a10]['userRef2']['id']);
        $this->assertEquals('user3', $dto[$a10]['userRef2']['username']);
        $this->assertEquals('user3.png', $dto[$a10]['userRef2']['avatar_ref']);
        $this->assertEquals('user3', $dto[$a10]['content']['user2']);
        $this->assertEquals($answer_updated->content, $dto[$a10]['content']['answer']);
        $this->assertEquals($comment1_updated->content, $dto[$a10]['content']['comment']);
    }
}
