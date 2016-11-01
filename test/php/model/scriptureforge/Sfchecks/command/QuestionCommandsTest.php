<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\Command\QuestionCommands;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\CommentModel;
use PHPUnit\Framework\TestCase;

class UserVoteTestEnvironment
{
    /** @var ProjectModel */
    public $project;

    /** @var string */
    public $projectId;

    /** @var string */
    public $userId;

    /** @var TextModel */
    public $text;

    /** @var QuestionModel */
    public $question;

    /** @var string */
    public $answerId;

    /** @var string */
    public $questionId;

    public function create()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $this->project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->text = new TextModel($this->project);
        $this->text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $this->text->content = $usx;
        $textId = $this->text->write();

        $this->question = new QuestionModel($this->project);
        $this->question->textRef->id = $textId;
        $this->question->write();

        $this->userId = $environ->createUser('test_user', 'Test User', 'test_user@example.com');
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

class QuestionCommandsTest extends TestCase
{
    public function testDeleteQuestions_NoThrow()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $question->write();

        $questionId = $question->id->asString();
        QuestionCommands::deleteQuestions($projectId, array($questionId));
    }

    public function testArchiveQuestions_2Questions_1Archived()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $question1 = new QuestionModel($project);
        $question1->title = 'Some Title';
        $question1->write();
        $question2 = new QuestionModel($project);
        $question2->title = 'Another Title';
        $question2->write();

        $this->assertEquals(false, $question1->isArchived);
        $this->assertEquals(false, $question2->isArchived);

        $count = QuestionCommands::archiveQuestions($project->id->asString(), array($question1->id->asString()));

        $question1->read($question1->id->asString());
        $question2->read($question2->id->asString());
        $this->assertEquals(1, $count);
        $this->assertTrue($question1->isArchived);
        $this->assertEquals(false, $question2->isArchived);
    }

    public function testPublishQuestions_2ArchivedQuestions_1Published()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $question1 = new QuestionModel($project);
        $question1->title = 'Some Title';
        $question1->isArchived = true;
        $question1->write();
        $question2 = new QuestionModel($project);
        $question2->title = 'Another Title';
        $question2->isArchived = true;
        $question2->write();

        $this->assertTrue($question1->isArchived);
        $this->assertTrue($question2->isArchived);

        $count = QuestionCommands::publishQuestions($project->id->asString(), array($question1->id->asString()));

        $question1->read($question1->id->asString());
        $question2->read($question2->id->asString());
        $this->assertEquals(1, $count);
        $this->assertFalse($question1->isArchived);
        $this->assertTrue($question2->isArchived);
    }

    public function testVoteUp_NoVotesThenUpAndDown_VoteGoesUpAndDown()
    {
        $environ = new UserVoteTestEnvironment();
        $environ->create();

        $dto = $environ->addAnswer('Some answer');

        $answer0 = $dto[$environ->answerId];
        $this->assertEquals(0, $answer0['score']);

        $dto = QuestionCommands::voteUp($environ->userId, $environ->projectId, $environ->questionId, $environ->answerId);

        $answer1 = $dto[$environ->answerId];
        $this->assertEquals(1, $answer1['score']);

        $dto = QuestionCommands::voteDown($environ->userId, $environ->projectId, $environ->questionId, $environ->answerId);

        $answer2 = $dto[$environ->answerId];
        $this->assertEquals(0, $answer2['score']);
    }

    public function testVoteUp_TwoVotes_NoChange()
    {
        new MongoTestEnvironment();
        $environ = new UserVoteTestEnvironment();
        $environ->create();

        $dto = $environ->addAnswer('Some answer');

        $answer0 = $dto[$environ->answerId];
        $this->assertEquals(0, $answer0['score']);

        QuestionCommands::voteUp($environ->userId, $environ->projectId, $environ->questionId, $environ->answerId);

        $dto = QuestionCommands::voteUp($environ->userId, $environ->projectId, $environ->questionId, $environ->answerId);

        $answer1 = $dto[$environ->answerId];
        $this->assertEquals(1, $answer1['score']);
    }

    public function testVoteDown_NoVote_NoChange()
    {
        $environ = new UserVoteTestEnvironment();
        $environ->create();

        $dto = $environ->addAnswer('Some answer');

        $answer0 = $dto[$environ->answerId];
        $this->assertEquals(0, $answer0['score']);

        $dto = QuestionCommands::voteDown($environ->userId, $environ->projectId, $environ->questionId, $environ->answerId);
        $this->assertInternalType('array', $dto);

        $answer1 = $dto[$environ->answerId];
        $this->assertEquals(0, $answer1['score']);
    }

    public function testUpdateAnswer_ExistingAnswer_OriginalAuthorIsPreserved()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = 'the answer';
        $user1Id = $environ->createUser('user1', 'user1', 'user1');
        $user2Id = $environ->createUser('user2', 'user2', 'user2');
        $answer->userRef->id = $user1Id;
        $answerId = $question->writeAnswer($answer);
        $answerArray = array(
            'id' => $answerId,
            'content' => 'updated answer'
        );

        QuestionCommands::updateAnswer($project->id->asString(), $questionId, $answerArray, $user2Id);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertEquals($user1Id, $newAnswer->userRef->asString());
    }

    public function testUpdateAnswer_ExistingAnswer_CantUpdateTagsOrExportFlag()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = 'the answer';
        $user1Id = $environ->createUser('user1', 'user1', 'user1');
        $answer->userRef->id = $user1Id;
        $answer->tags[] = 'originalTag';
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);
        $answerArray = array(
            'id' => $answerId,
            'content' => 'updated answer',
            'tags' => array('updatedTag'),
            'isToBeExported' => false
        );

        QuestionCommands::updateAnswer($project->id->asString(), $questionId, $answerArray, $user1Id);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertEquals('updated answer', $newAnswer->content);
        $this->assertCount(1, $newAnswer->tags);
        $this->assertEquals('originalTag', $newAnswer->tags[0]);
        $this->assertTrue($newAnswer->isToBeExported);
    }

    public function testUpdateAnswerExportFlag_ExistingAnswer_ChangePersists()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = 'the answer';
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
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $answer = new AnswerModel();
        $answer->content = 'the answer';
        $answer->tags[] = 'originalTag';
        $answerId = $question->writeAnswer($answer);
        $tagsArray = array('updatedTag');

        $dto = QuestionCommands::updateAnswerTags($project->id->asString(), $questionId, $answerId, $tagsArray);

        $question->read($questionId);
        $newAnswer = $question->readAnswer($answerId);
        $this->assertCount(1, $newAnswer->tags);
        $this->assertEquals('updatedTag', $newAnswer->tags[0]);
        $this->assertEquals('updatedTag', $dto[$answerId]['tags'][0]);
    }

    public function testUpdateComment_ExistingComment_OriginalAuthorIsPreserved()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();
        $question = new QuestionModel($project);
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $user1Id = $environ->createUser('user1', 'user1', 'user1');
        $user2Id = $environ->createUser('user2', 'user2', 'user2');

        $answer = new AnswerModel();
        $answer->content = 'the answer';
        $answer->userRef->id = $user2Id;
        $answerId = $question->writeAnswer($answer);

        $comment = new CommentModel();
        $comment->userRef->id = $user1Id;
        $comment->content = 'the comment';

        $commentId = $question->writeComment($project->databaseName(), $questionId, $answerId, $comment);

        $commentArray = array(
            'id' => $commentId,
            'content' => 'updated comment'
        );

        QuestionCommands::updateComment($project->id->asString(), $questionId, $answerId, $commentArray, $user2Id);
        $question->read($questionId);
        $newComment = $question->readComment($answerId, $commentId);
        $this->assertEquals($user1Id, $newComment->userRef->asString());
    }
}
