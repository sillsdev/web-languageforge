<?php

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\Dto\QuestionListDto;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Rights\ProjectRoles;
//use PHPUnit\Framework\TestCase;

class QuestionListDtoTest extends PHPUnit_Framework_TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass()
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    /**
     * Cleanup test environment
     */
    public function tearDown()
    {
        self::$environ->clean();
    }

    public function testEncode_QuestionWithAnswers_DtoReturnsExpectedData()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $text = new TextModel($project);
        $text->title = 'Chapter 3';
        $text->content = '<usx version="2.0"> <chapter number="1" style="c" /> <verse number="1" style="v" /> ' .
            '<para style="q1">Blessed is the man</para> ' .
            '<para style="q2">who does not walk in the counsel of the wicked</para> ' .
            '<para style="q1">or stand in the way of sinners</para> <usx>';
        $textId = $text->write();

        // Answers are tied to specific users, so let's create some sample users
        $user1Id = self::$environ->createUser('jcarter', 'John Carter', 'johncarter@example.com');
        $user2Id = self::$environ->createUser('dthoris', 'Dejah Thoris', 'princess@example.com');

        // Two questions, with different numbers of answers and different create dates
        $question1 = new QuestionModel($project);
        $question1->title = 'Who is speaking?';
        $question1->description = 'Who is telling the story in this text?';
        $question1->textRef->id = $textId;
        $question1->write();
        $question1->dateCreated->addSeconds(-date_interval_create_from_date_string('1 day')->s);
        $question1Id = $question1->write();

        $question2 = new QuestionModel($project);
        $question2->title = 'Where is the storyteller?';
        $question2->description = 'The person telling this story has just arrived somewhere. Where is he?';
        $question2->textRef->id = $textId;
        $question2Id = $question2->write();

        // One answer for question 1...
        $answer1 = new AnswerModel();
        $answer1->content = 'Me, John Carter.';
        $answer1->score = 10;
        $answer1->userRef->id = $user1Id;
        $answer1->textHightlight = 'I knew that I was on Mars';
        $question1->writeAnswer($answer1);

        // ... and two answers for question 2
        $answer2 = new AnswerModel();
        $answer2->content = 'On Mars.';
        $answer2->score = 1;
        $answer2->userRef->id = $user1Id;
        $answer2->textHightlight = 'I knew that I was on Mars';
        $question2->writeAnswer($answer2);

        $answer3 = new AnswerModel();
        $answer3->content = 'On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.';
        $answer3->score = 7;
        $answer3->userRef->id = $user2Id;
        $answer3->textHightlight = 'I knew that I was on Mars';
        $answer3Id = $question2->writeAnswer($answer3);

        // Comments should NOT show up in the answer count; let's test this.
        $comment1 = new CommentModel();
        $comment1->content = 'By the way, our name for Earth is Jasoom.';
        $comment1->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $question2Id, $answer3Id, $comment1);

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all looks right, 1 Text & 2 Questions
        $this->assertEquals(2, $dto['count']);
        $this->assertInternalType('array', $dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry0 = $entriesById[$question1Id];
        $entry1 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry0['title']);
        $this->assertEquals('Where is the storyteller?', $entry1['title']);
        $this->assertEquals(1, $entry0['answerCount']);
        $this->assertEquals(2, $entry1['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(3, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry0['responseCount']);
        $this->assertEquals(3, $entry1['responseCount']);
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // archive 1 Question
        $question2->isArchived = true;
        $question2->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all still looks right, now only 1 Question
        $this->assertEquals(1, $dto['count']);
        $this->assertEquals($question1Id, $dto['entries'][0]['id']);
        $this->assertEquals('Who is speaking?', $dto['entries'][0]['title']);
    }

    /**
     * @expectedException Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException
     */
    public function testEncode_ArchivedText_ManagerCanViewContributorCannot()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // archived Text
        $text = new TextModel($project);
        $text->title = 'Chapter 3';
        $text->isArchived = true;
        $textId = $text->write();

        // Answers are tied to specific users, so let's create some sample users
        $managerId = self::$environ->createUser('jcarter', 'John Carter', 'johncarter@example.com');
        $contributorId = self::$environ->createUser('dthoris', 'Dejah Thoris', 'princess@example.com');
        $project->addUser($managerId, ProjectRoles::MANAGER);
        $project->addUser($contributorId, ProjectRoles::CONTRIBUTOR);
        $project->write();

        $dto = QuestionListDto::encode($projectId, $textId, $managerId);

        // Manager can view archived Text
        $this->assertEquals('Chapter 3', $dto['text']['title']);

        // Contributor cannot view archived Text, throw Exception
        self::$environ->inhibitErrorDisplay();

        QuestionListDto::encode($projectId, $textId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    /**
     * @depends testEncode_ArchivedText_ManagerCanViewContributorCannot
     */
    public function testEncode_ArchivedText_ManagerCanViewContributorCannot_RestoreErrorDisplay()
    {
        // restore error display after last test
        self::$environ->restoreErrorDisplay();
    }
}
