<?php

use models\commands\QuestionCommands;
use models\AnswerModel;
use models\CommentModel;
use models\QuestionModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class UserVoteTestEnvironment
{
    /**
	 * @var ProjectModel
	 */
    public $project;

    /**
	 * @var string
	 */
    public $projectId;

    /**
	 * @var QuestionModel
	 */
    public $question;

    /**
	 * @var string
	 */
    public $answerId;

    /**
	 * @var string
	 */
    public $questionId;

    public function create()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $this->project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $this->question = new QuestionModel($this->project);
        $this->question->write();

        $this->userId = $e->createUser('test_user', 'Test User', 'test_user@example.com');
        $this->projectId = $this->project->id->asString();
        $this->questionId = $this->question->id->asString();
    }

    public function addAnswer($content)
    {
        $object = array();
        $object['id'] = '';
        $object['content'] = $content;
        $dto = QuestionCommands::updateAnswer($this->projectId, $this->questionId, $object, $this->userId);
        $keys = array_keys($dto);
        $this->answerId = $keys[0];

        return $dto;
    }
}

class TestQuestionCommands extends UnitTestCase
{
    public function testDeleteQuestions_NoThrow()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $question = new QuestionModel($project);
        $question->write();

        $questionId = $question->id->asString();
        QuestionCommands::deleteQuestions($projectId, array($questionId));
    }

    public function testArchiveQuestions_2Questions_1Archived()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $question1 = new QuestionModel($project);
        $question1->title = "Some Title";
        $question1->write();
        $question2 = new QuestionModel($project);
        $question2->title = "Another Title";
        $question2->write();

        $this->assertEqual($question1->isArchived, false);
        $this->assertEqual($question2->isArchived, false);

        $count = QuestionCommands::archiveQuestions($project->id->asString(), array($question1->id->asString()));

        $question1->read($question1->id->asString());
        $question2->read($question2->id->asString());
        $this->assertEqual($count, 1);
        $this->assertEqual($question1->isArchived, true);
        $this->assertEqual($question2->isArchived, false);
    }

    public function testPublishQuestions_2ArchivedQuestions_1Published()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $question1 = new QuestionModel($project);
        $question1->title = "Some Title";
        $question1->isArchived = true;
        $question1->write();
        $question2 = new QuestionModel($project);
        $question2->title = "Another Title";
        $question2->isArchived = true;
        $question2->write();

        $this->assertEqual($question1->isArchived, true);
        $this->assertEqual($question2->isArchived, true);

        $count = QuestionCommands::publishQuestions($project->id->asString(), array($question1->id->asString()));

        $question1->read($question1->id->asString());
        $question2->read($question2->id->asString());
        $this->assertEqual($count, 1);
        $this->assertEqual($question1->isArchived, false);
        $this->assertEqual($question2->isArchived, true);
    }

    public function testVoteUp_NoVotesThenUpAndDown_VoteGoesUpAndDown()
    {
        $e = new UserVoteTestEnvironment();
        $e->create();

        $dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);

        $answer0 = $dto[$e->answerId];
        $this->assertEqual(0, $answer0['score']);

        $dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);

        $answer1 = $dto[$e->answerId];
        $this->assertEqual(1, $answer1['score']);

        $dto = QuestionCommands::voteDown($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);

        $answer2 = $dto[$e->answerId];
        $this->assertEqual(0, $answer2['score']);
    }

    public function testVoteUp_TwoVotes_NoChange()
    {
        $mte = new MongoTestEnvironment();
        $e = new UserVoteTestEnvironment();
        $e->create();

        $dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);

        $answer0 = $dto[$e->answerId];
        $this->assertEqual(0, $answer0['score']);

        $dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);

        $dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);

        $answer1 = $dto[$e->answerId];
        $this->assertEqual(1, $answer1['score']);
    }

    public function testVoteDown_NoVote_NoChange()
    {
        $e = new UserVoteTestEnvironment();
        $e->create();

        $dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);

        $answer0 = $dto[$e->answerId];
        $this->assertEqual(0, $answer0['score']);

        $dto = QuestionCommands::voteDown($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 	 	var_dump($dto, $e->answerId);
        $this->assertIsA($dto, 'array');

        $answer1 = $dto[$e->answerId];
        $this->assertEqual(0, $answer1['score']);
    }

    public function testUpdateAnswer_ExistingAnswer_OriginalAuthorIsPreserved()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $question = new QuestionModel($project);
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = "the answer";
        $user1Id = $e->createUser("user1", "user1", "user1");
        $user2Id = $e->createUser("user2", "user2", "user2");
        $answer->userRef->id = $user1Id;
        $answerId = $question->writeAnswer($answer);
        $answerArray = array(
            "id" => $answerId,
            "content" => "updated answer"
        );

        QuestionCommands::updateAnswer($project->id->asString(), $questionId, $answerArray, $user2Id);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertEqual($user1Id, $newAnswer->userRef->asString());
    }

    public function testUpdateAnswer_ExistingAnswer_CantUpdateTagsOrExportFlag()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $question = new QuestionModel($project);
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = "the answer";
        $user1Id = $e->createUser("user1", "user1", "user1");
        $answer->userRef->id = $user1Id;
        $answer->tags[] = 'originalTag';
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);
        $answerArray = array(
            "id" => $answerId,
            "content" => "updated answer",
            "tags" => array('updatedTag'),
            "isToBeExported" => false
        );

        QuestionCommands::updateAnswer($project->id->asString(), $questionId, $answerArray, $user1Id);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertEqual($newAnswer->content, "updated answer");
        $this->assertEqual(count($newAnswer->tags), 1);
        $this->assertEqual($newAnswer->tags[0], 'originalTag');
        $this->assertEqual($newAnswer->isToBeExported, true);
    }

    public function testUpdateAnswerExportFlag_ExistingAnswer_ChangePersists()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $question = new QuestionModel($project);
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = "the answer";
        $answer->isToBeExported = false;
        $answerId = $question->writeAnswer($answer);
        $isToBeExported = true;

        $dto = QuestionCommands::updateAnswerExportFlag($project->id->asString(), $questionId, $answerId, $isToBeExported);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertTrue($newAnswer->isToBeExported);
        $this->assertTrue($dto[$answerId]['isToBeExported']);
    }

    public function testUpdateAnswerTags_ExistingAnswer_ChangePersists()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $question = new QuestionModel($project);
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = "the answer";
        $answer->tags[] = 'originalTag';
        $answerId = $question->writeAnswer($answer);
        $tagsArray = array('updatedTag');

        $dto = QuestionCommands::updateAnswerTags($project->id->asString(), $questionId, $answerId, $tagsArray);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertEqual(count($newAnswer->tags), 1);
        $this->assertEqual($newAnswer->tags[0], 'updatedTag');
        $this->assertEqual($dto[$answerId]['tags'][0], 'updatedTag');
    }

    public function testUpdateComment_ExistingComment_OriginalAuthorIsPreserved()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $question = new QuestionModel($project);
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = "the answer";
        $answerId = $question->writeAnswer($answer);

        $user1Id = $e->createUser("user1", "user1", "user1");
        $user2Id = $e->createUser("user2", "user2", "user2");

        $comment = new CommentModel();
        $comment->userRef->id = $user1Id;
        $comment->content = "the comment";

        $commentId = $question->writeComment($project->databaseName(), $questionId, $answerId, $comment);

        $commentArray = array(
            "id" => $commentId,
            "content" => "updated comment"
        );

        QuestionCommands::updateComment($project->id->asString(), $questionId, $answerId, $commentArray, $user2Id);
        $question->read($questionId);
        $newComment = $question->readComment($answerId, $commentId);
        $this->assertEqual($user1Id, $newComment->userRef->asString());
    }
}
