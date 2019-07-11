<?php

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\Dto\QuestionListDto;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Rights\ProjectRoles;
use PHPUnit\Framework\TestCase;

require_once "CommonQuestionsAndAnswersForDto.php";

class QuestionListDtoTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    /**
     * Cleanup test environment
     */
    public function tearDown(): void
    {
        self::$environ->clean();
    }

    public function testEncode_QuestionWithAnswersWhenUsersCanViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $textId, $user1Id, $user2Id, $user3Id, $question1Id, $question2Id) = $this->createProjectForTestingQuestionsAndAnswers();

        // Question 1 has 1 answer by John Carter, 0 by Dejah Thoris.
        // Question 2 has 1 answer by John Carter, 1 by Dejah Thoris. Dejah Thoris's answer also contains 1 comment by Dejah Thoris and 1 by John Carter.

        $project = new SfchecksProjectModel($projectId);
        $project->usersSeeEachOthersResponses = true;
        $project->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all looks right, 1 Text & 2 Questions
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry0 = $entriesById[$question1Id];
        $entry1 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry0['title']);
        $this->assertEquals('Where is the storyteller?', $entry1['title']);
        $this->assertEquals(1, $entry0['answerCount']);
        $this->assertEquals(2, $entry1['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry0['responseCount']);
        $this->assertEquals(5, $entry1['responseCount']);
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // Now check the same things, from the point of view of Dejah Thoris
        $dto = QuestionListDto::encode($projectId, $textId, $user2Id);
        // In this test, the expected counts should be *exactly* the same as from John Carter's POV
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry0 = $entriesById[$question1Id];
        $entry1 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry0['title']);
        $this->assertEquals('Where is the storyteller?', $entry1['title']);
        $this->assertEquals(1, $entry0['answerCount']);
        $this->assertEquals(2, $entry1['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry0['responseCount']);
        $this->assertEquals(5, $entry1['responseCount']);
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // And also from the point of view of Tars Tarkas, a project manager
        $dto = QuestionListDto::encode($projectId, $textId, $user3Id);
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry0 = $entriesById[$question1Id];
        $entry1 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry0['title']);
        $this->assertEquals('Where is the storyteller?', $entry1['title']);
        $this->assertEquals(1, $entry0['answerCount']);
        $this->assertEquals(2, $entry1['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry0['responseCount']);
        $this->assertEquals(5, $entry1['responseCount']);
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // archive 1 Question
        $question2 = new QuestionModel($project, $question2Id);
        $question2->isArchived = true;
        $question2->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all still looks right, now only 1 Question
        $this->assertEquals(1, $dto['count']);
        $this->assertEquals($question1Id, $dto['entries'][0]['id']);
        $this->assertEquals('Who is speaking?', $dto['entries'][0]['title']);
    }

    public function testEncode_QuestionWithAnswersWhenUsersCannotViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $textId, $user1Id, $user2Id, $user3Id, $question1Id, $question2Id) = $this->createProjectForTestingQuestionsAndAnswers();

        // Question 1 has 1 answer by John Carter, 0 by Dejah Thoris.
        // Question 2 has 1 answer by John Carter, 1 by Dejah Thoris. Dejah Thoris's answer also contains 1 comment by Dejah Thoris and 1 by John Carter.

        $project = new SfchecksProjectModel($projectId);
        $project->usersSeeEachOthersResponses = false;
        $project->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all looks right, 1 Text & 2 Questions
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry1 = $entriesById[$question1Id];
        $entry2 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry1['title']);
        $this->assertEquals('Where is the storyteller?', $entry2['title']);
        $this->assertEquals(1, $entry1['answerCount']);
        $this->assertNotEquals(2, $entry2['answerCount'], 'Answers by other users should not be included in answer count in this scenario.');
        $this->assertEquals(1, $entry2['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry1['responseCount']);
        $this->assertNotEquals(4, $entry2['responseCount'], 'Only a user\'s own comments should be included in response count in this scenario.');
        $this->assertEquals(2, $entry2['responseCount']); // Because John Carter cannot see Dejah Thoris's answer, he cannot see his own comment in response to that answer
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // Now check the same things, from the point of view of Dejah Thoris
        $dto = QuestionListDto::encode($projectId, $textId, $user2Id);
        // The expected counts should be different from what John Carter sees
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry1 = $entriesById[$question1Id];
        $entry2 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry1['title']);
        $this->assertEquals('Where is the storyteller?', $entry2['title']);
        $this->assertNotEquals(1, $entry1['answerCount'], 'Answers by other users should not be included in answer count in this scenario.');
        $this->assertEquals(0, $entry1['answerCount']);
        $this->assertNotEquals(2, $entry2['answerCount'], 'Answers by other users should not be included in answer count in this scenario.');
        $this->assertEquals(1, $entry2['answerCount']);
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertNotEquals(1, $entry1['responseCount'], 'Only a user\'s own comments should be included in response count in this scenario.');
        $this->assertEquals(0, $entry1['responseCount']);
        $this->assertNotEquals(4, $entry2['responseCount'], 'Only a user\'s own comments should be included in response count in this scenario.');
        $this->assertEquals(2, $entry2['responseCount']); // Dejah Thoris can see her own answer and comment, but not John Carter's comment on her answer
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // And also from the point of view of Tars Tarkas, a project manager
        $dto = QuestionListDto::encode($projectId, $textId, $user3Id);
        $this->assertEquals(2, $dto['count']);
        $this->assertIsArray($dto['entries']);
        $entriesById = self::$environ->indexItemsBy($dto['entries'], 'id');
        $entry0 = $entriesById[$question1Id];
        $entry1 = $entriesById[$question2Id];
        $this->assertEquals('Who is speaking?', $entry0['title']);
        $this->assertEquals('Where is the storyteller?', $entry1['title']);
        $this->assertEquals(1, $entry0['answerCount'], 'Project managers should still see all answers in this scenario.');
        $this->assertEquals(2, $entry1['answerCount'], 'Project managers should still see all answers in this scenario.');
        // Specifically check if comments got included in answer count
        $this->assertNotEquals(4, $dto['entries'][1]['answerCount'], 'Comments should not be included in answer count.');
        $this->assertEquals(1, $entry0['responseCount'], 'Project managers should still see all comments in this scenario.');
        $this->assertEquals(5, $entry1['responseCount'], 'Project managers should still see all comments in this scenario.');
        // make sure our text content is coming down into the dto
        $this->assertTrue(strlen($dto['text']['content']) > 0);

        // archive 1 Question
        $question2 = new QuestionModel($project, $question2Id);
        $question2->isArchived = true;
        $question2->write();

        $dto = QuestionListDto::encode($projectId, $textId, $user1Id);

        // Now check that it all still looks right, now only 1 Question
        $this->assertEquals(1, $dto['count']);
        $this->assertEquals($question1Id, $dto['entries'][0]['id']);
        $this->assertEquals('Who is speaking?', $dto['entries'][0]['title']);
    }

    public function testEncode_ArchivedText_ManagerCanViewContributorCannot()
    {
        $this->expectException(ResourceNotAvailableException::class);

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
        QuestionListDto::encode($projectId, $textId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    /**
     * Common code between the two Q&A tests, factored out so it's not duplicated.
     * @return array
     */
    public function createProjectForTestingQuestionsAndAnswers(): array
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment1Id, $comment2Id) =
            CommonQuestionsAndAnswersForDto::createProjectForTestingAnswerVisibility(self::$environ);

        return [$projectId, $text1Id, $user1Id, $user2Id, $user3Id, $question1Id, $question2Id];
    }
}
