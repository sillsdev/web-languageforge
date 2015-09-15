<?php

use Api\Model\Scriptureforge\Dto\QuestionCommentDto;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\AnswerModel;
use Api\Model\CommentModel;
use Api\Model\ProjectModel;
use Api\Model\QuestionModel;
use Api\Model\TextModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "Api/Model/ProjectModel.php";
require_once SourcePath . "Api/Model/QuestionModel.php";

class TestQuestionCommentDto extends UnitTestCase
{

    public function __construct() {
        $this->environ = new MongoTestEnvironment();
        $this->environ->clean();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var MongoTestEnvironment
     */
    private $environ;

    /**
     * Cleanup test environment
     */
    public function tearDown()
    {
        $this->environ->clean();
    }

    public function testEncode_FullQuestionWithAnswersAndComments_DtoReturnsExpectedData()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = $this->environ->createUser("user1", "user1", "user1@email.com");
        $user2Id = $this->environ->createUser("user2", "user2", "user2@email.com");
        $user3Id = $this->environ->createUser("user3", "user3", "user3@email.com");

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->textHightlight = "text highlight";
        $answerId = $question->writeAnswer($answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = "first comment";
        $comment1->userRef->id = $user1Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = "second comment";
        $comment2->userRef->id = $user2Id;
        $comment2Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);

        $dto = QuestionCommentDto::encode($project->id->asString(), $questionId, $user1Id);
        //var_dump($dto);

        $aid = $answerId;
        $cid1 = $comment1Id;
        $cid2 = $comment2Id;
        $this->assertEqual($dto['project']['id'], $project->id);
        //$this->assertEqual($dto['text']['content'], $text->content);
        $this->assertEqual($dto['question']['id'], $questionId);
        $this->assertEqual($dto['question']['title'], 'the question');
        $this->assertEqual($dto['question']['description'], 'question description');
        $this->assertEqual($dto['question']['answers'][$aid]['content'], 'first answer');
        $this->assertEqual($dto['question']['answers'][$aid]['score'], 10);
        $this->assertEqual($dto['question']['answers'][$aid]['userRef']['avatar_ref'], 'user3.png');
        $this->assertEqual($dto['question']['answers'][$aid]['userRef']['username'], 'user3');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid1]['content'], 'first comment');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid1]['userRef']['username'], 'user1');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid1]['userRef']['avatar_ref'], 'user1.png');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid2]['content'], 'second comment');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid2]['userRef']['username'], 'user2');
        $this->assertEqual($dto['question']['answers'][$aid]['comments'][$cid2]['userRef']['avatar_ref'], 'user2.png');
    }

    public function testEncode_ArchivedQuestion_ManagerCanViewContributorCannot()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $managerId = $this->environ->createUser("manager", "manager", "manager@email.com");
        $contributorId = $this->environ->createUser("contributor1", "contributor1", "contributor1@email.com");
        $project->addUser($managerId, ProjectRoles::MANAGER);
        $project->addUser($contributorId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        // Text not archived but Question is archived
        $text = new TextModel($project);
        $text->title = "Text 1";
        $textId = $text->write();

        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $question->isArchived = true;
        $questionId = $question->write();

        $dto = QuestionCommentDto::encode($project->id->asString(), $questionId, $managerId);

        // Manager can view Question of archived Text
        $this->assertEqual($dto['question']['title'], 'the question');

        // Contributor cannot view Question of archived Text, throw Exception
        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        $dto = QuestionCommentDto::encode($project->id->asString(), $questionId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testEncode_ArchivedQuestion_ManagerCanViewContributorCannot
    public function testEncode_ArchivedQuestion_ManagerCanViewContributorCannot_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testEncode_ArchivedText_ManagerCanViewContributorCannot()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $managerId = $this->environ->createUser("manager", "manager", "manager@email.com");
        $contributorId = $this->environ->createUser("contributor1", "contributor1", "contributor1@email.com");
        $project->addUser($managerId, ProjectRoles::MANAGER);
        $project->addUser($contributorId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        // Question not archived but Text is archived
        $text = new TextModel($project);
        $text->title = "Text 1";
        $text->isArchived = true;
        $textId = $text->write();

        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();

        $dto = QuestionCommentDto::encode($project->id->asString(), $questionId, $managerId);

        // Manager can view Question of archived Text
        $this->assertEqual($dto['question']['title'], 'the question');

        // Contributor cannot view Question of archived Text, throw Exception
        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        $dto = QuestionCommentDto::encode($project->id->asString(), $questionId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testEncode_ArchivedText_ManagerCanViewContributorCannot
    public function testEncode_ArchivedText_ManagerCanViewContributorCannot_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }
}
