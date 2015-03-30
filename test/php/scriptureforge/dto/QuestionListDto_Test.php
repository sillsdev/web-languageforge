<?php

use models\shared\rights\ProjectRoles;
use models\scriptureforge\dto\QuestionListDto;
use models\AnswerModel;
use models\CommentModel;
use models\QuestionModel;
use models\TextModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestQuestionListDto extends UnitTestCase
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

    public function testEncode_QuestionWithAnswers_DtoReturnsExpectedData()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $text = new TextModel($project);
        $text->title = "Chapter 3";
        $text->content = '<usx version="2.0"> <chapter number="1" style="c" /> <verse number="1" style="v" /> <para style="q1">Blessed is the man</para> <para style="q2">who does not walk in the counsel of the wicked</para> <para style="q1">or stand in the way of sinners</para> <usx>';
        $textId = $text->write();

        // Answers are tied to specific users, so let's create some sample users
        $user1Id = $this->environ->createUser("jcarter", "John Carter", "johncarter@example.com");
        $user2Id = $this->environ->createUser("dthoris", "Dejah Thoris", "princess@example.com");

        // Two questions, with different numbers of answers and different create dates
        $question1 = new QuestionModel($project);
        $question1->title = "Who is speaking?";
        $question1->description = "Who is telling the story in this text?";
        $question1->textRef->id = $textId;
        $question1->write();
        $question1->dateCreated->sub(date_interval_create_from_date_string('1 day'));
        $question1Id = $question1->write();

        $question2 = new QuestionModel($project);
        $question2->title = "Where is the storyteller?";
        $question2->description = "The person telling this story has just arrived somewhere. Where is he?";
        $question2->textRef->id = $textId;
        $question2Id = $question2->write();

        // One answer for question 1...
        $answer1 = new AnswerModel();
        $answer1->content = "Me, John Carter.";
        $answer1->score = 10;
        $answer1->userRef->id = $user1Id;
        $answer1->textHightlight = "I knew that I was on Mars";
        $answer1Id = $question1->writeAnswer($answer1);

        // ... and two answers for question 2
        $answer2 = new AnswerModel();
        $answer2->content = "On Mars.";
        $answer2->score = 1;
        $answer2->userRef->id = $user1Id;
        $answer2->textHightlight = "I knew that I was on Mars";
        $answer2Id = $question2->writeAnswer($answer2);

        $answer3 = new AnswerModel();
        $answer3->content = "On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.";
        $answer3->score = 7;
        $answer3->userRef->id = $user2Id;
        $answer3->textHightlight = "I knew that I was on Mars";
        $answer3Id = $question2->writeAnswer($answer3);

        // Comments should NOT show up in the answer count; let's test this.
        $comment1 = new CommentModel();
        $comment1->content = "By the way, our name for Earth is Jasoom.";
        $comment1->userRef->id = $user2Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $question2Id, $answer3Id, $comment1);

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all looks right, 1 Text & 2 Questions
        $this->assertEqual($dto['count'], 2);
        $this->assertIsa($dto['entries'], 'array');
        $this->assertEqual($dto['entries'][0]['id'], $question2Id);
        $this->assertEqual($dto['entries'][1]['id'], $question1Id);
        $this->assertEqual($dto['entries'][0]['title'], "Where is the storyteller?");
        $this->assertEqual($dto['entries'][1]['title'], "Who is speaking?");
        $this->assertEqual($dto['entries'][0]['answerCount'], 2);
        $this->assertEqual($dto['entries'][1]['answerCount'], 1);
        // Specifically check if comments got included in answer count
        $this->assertNotEqual($dto['entries'][1]['answerCount'], 3, "Comments should not be included in answer count.");
        $this->assertEqual($dto['entries'][0]['responseCount'], 3);
        $this->assertEqual($dto['entries'][1]['responseCount'], 1);
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // archive 1 Question
        $question2->isArchived = true;
        $question2->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all still looks right, now only 1 Question
        $this->assertEqual($dto['count'], 1);
        $this->assertEqual($dto['entries'][0]['id'], $question1Id);
        $this->assertEqual($dto['entries'][0]['title'], "Who is speaking?");
    }

    public function testEncode_ArchivedText_ManagerCanViewContributorCannot()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // archived Text
        $text = new TextModel($project);
        $text->title = "Chapter 3";
        $text->isArchived = true;
        $textId = $text->write();

        // Answers are tied to specific users, so let's create some sample users
        $managerId = $this->environ->createUser("jcarter", "John Carter", "johncarter@example.com");
        $contributorId = $this->environ->createUser("dthoris", "Dejah Thoris", "princess@example.com");
        $project->addUser($managerId, ProjectRoles::MANAGER);
        $project->addUser($contributorId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $dto = QuestionListDto::encode($projectId, $textId, $managerId);

        // Manager can view archived Text
        $this->assertEqual($dto['text']['title'], "Chapter 3");

        // Contributor cannot view archived Text, throw Exception
        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        $dto = QuestionListDto::encode($projectId, $textId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test was designed to finish testEncode_ArchivedText_ManagerCanViewContributorCannot
    public function testEncode_ArchivedText_ManagerCanViewContributorCannot_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }
}
