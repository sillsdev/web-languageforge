<?php

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\Dto\QuestionCommentDto;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\Rights\ProjectRoles;
use PHPUnit\Framework\TestCase;

require_once "CommonQuestionsAndAnswersForDto.php";

class QuestionCommentDtoTest extends TestCase
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

    public function testEncode_TextWithQuestionsWhenUsersCanViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) = $this->createProjectForTestingAnswerVisibility();

        $sfchecksProject = new SfchecksProjectModel($projectId);
        $sfchecksProject->usersSeeEachOthersResponses = true;
        $sfchecksProject->write();

        // In this test, all three users (the contributors John Carter and Dejah Thoris, and the manager Tars Tarkas) should see identical views of the data.

        // John Carter's point of view
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user1Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user1Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);

        // Dejah Thoris's point of view
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user2Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user2Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);

        // Tars Tarkas's point of view
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user3Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user3Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);
    }

    public function testEncode_TextWithQuestionsWhenUsersCannotViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) = $this->createProjectForTestingAnswerVisibility();

        $sfchecksProject = new SfchecksProjectModel($projectId);
        $sfchecksProject->usersSeeEachOthersResponses = false;
        $sfchecksProject->write();

        // In this test, John Carter and Dejah Thoris should see *different* views of the data.
        // Below, I've kept (but commented out) the assertions that check for data that *would* be seen if the project settings
        // allowed it. That way the CanViewEachOthersAnswers and CannotViewEachOthersAnswers tests will be easily comparable.


        // John Carter's point of view
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user1Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user1Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        // John Carter does not see Dejah Thoris's answer, nor any of the comments below it (including his own)
        $this->assertKeyNotPresent($answer3Id, $dto['question']['answers']);
//        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
//        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
//        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
//        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
//        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
//        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
//        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);


        // Dejah Thoris's point of view
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user2Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        // Dejah Thoris does not see John Carter's answer
        $this->assertKeyNotPresent($answer1Id, $dto['question']['answers']);
//        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
//        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
//        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
//        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user2Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        // Dejah Thoris does not see John Carter's answer
        $this->assertKeyNotPresent($answer2Id, $dto['question']['answers']);
//        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
//        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
//        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
//        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
//        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
//        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
//        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        // She does see her own answer, but not John Carter's comment on her answer
        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
        $this->assertKeyNotPresent($comment2Id, $dto['question']['answers'][$answer3Id]['comments']);
//        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
//        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
//        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);


        // Tars Tarkas's point of view: as a project manager, he can still see everything
        $dto = QuestionCommentDto::encode($projectId, $question1Id, $user3Id);
        $this->assertEquals($projectId, $dto['project']['id']);

        $this->assertEquals($question1Id, $dto['question']['id']);
        $this->assertEquals('Who is speaking?', $dto['question']['title']);
        $this->assertEquals('Who is telling the story in this text?', $dto['question']['description']);
        $this->assertEquals('Me, John Carter.', $dto['question']['answers'][$answer1Id]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$answer1Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer1Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer1Id]['userRef']['username']);

        $dto = QuestionCommentDto::encode($projectId, $question2Id, $user3Id);
        $this->assertEquals($question2Id, $dto['question']['id']);
        $this->assertEquals('Where is the storyteller?', $dto['question']['title']);
        $this->assertEquals('The person telling this story has just arrived somewhere. Where is he?', $dto['question']['description']);
        $this->assertEquals('On Mars.', $dto['question']['answers'][$answer2Id]['content']);
        $this->assertEquals(1, $dto['question']['answers'][$answer2Id]['score']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['userRef']['avatar_ref']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['userRef']['username']);
        $this->assertEquals('By the way, the inhabitants of Mars call it Barsoom.', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer2Id]['comments'][$comment0Id]['userRef']['avatar_ref']);

        $this->assertEquals('On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.', $dto['question']['answers'][$answer3Id]['content']);
        $this->assertEquals('By the way, our name for Earth is Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['content']);
        $this->assertEquals('dthoris', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['username']);
        $this->assertEquals('dthoris.png', $dto['question']['answers'][$answer3Id]['comments'][$comment1Id]['userRef']['avatar_ref']);
        $this->assertEquals('Although I have learned to think of Mars as Barsoom, I still think of Earth as Earth, not Jasoom.', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['content']);
        $this->assertEquals('jcarter', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['username']);
        $this->assertEquals('jcarter.png', $dto['question']['answers'][$answer3Id]['comments'][$comment2Id]['userRef']['avatar_ref']);
    }

    public function testEncode_FullQuestionWithAnswersAndComments_DtoReturnsExpectedData()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = self::$environ->createUser("user1", "user1", "user1@email.com");
        $user2Id = self::$environ->createUser("user2", "user2", "user2@email.com");
        $user3Id = self::$environ->createUser("user3", "user3", "user3@email.com");

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
        $this->assertEquals($project->id, $dto['project']['id']);
        //$this->assertEquals($text->content, $dto['text']['content']);
        $this->assertEquals($questionId, $dto['question']['id']);
        $this->assertEquals('the question', $dto['question']['title']);
        $this->assertEquals('question description', $dto['question']['description']);
        $this->assertEquals('first answer', $dto['question']['answers'][$aid]['content']);
        $this->assertEquals(10, $dto['question']['answers'][$aid]['score']);
        $this->assertEquals('user3.png', $dto['question']['answers'][$aid]['userRef']['avatar_ref']);
        $this->assertEquals('user3', $dto['question']['answers'][$aid]['userRef']['username']);
        $this->assertEquals('first comment', $dto['question']['answers'][$aid]['comments'][$cid1]['content']);
        $this->assertEquals('user1', $dto['question']['answers'][$aid]['comments'][$cid1]['userRef']['username']);
        $this->assertEquals('user1.png', $dto['question']['answers'][$aid]['comments'][$cid1]['userRef']['avatar_ref']);
        $this->assertEquals('second comment', $dto['question']['answers'][$aid]['comments'][$cid2]['content']);
        $this->assertEquals('user2', $dto['question']['answers'][$aid]['comments'][$cid2]['userRef']['username']);
        $this->assertEquals('user2.png', $dto['question']['answers'][$aid]['comments'][$cid2]['userRef']['avatar_ref']);
    }

    public function testEncode_ArchivedQuestion_ManagerCanViewContributorCannot()
    {
        $this->expectException(ResourceNotAvailableException::class);

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $managerId = self::$environ->createUser("manager", "manager", "manager@email.com");
        $contributorId = self::$environ->createUser("contributor1", "contributor1", "contributor1@email.com");
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
        $this->assertEquals('the question', $dto['question']['title']);

        // Contributor cannot view Question of archived Text, throw Exception
        QuestionCommentDto::encode($project->id->asString(), $questionId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testEncode_ArchivedText_ManagerCanViewContributorCannot()
    {
        $this->expectException(ResourceNotAvailableException::class);

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $managerId = self::$environ->createUser("manager", "manager", "manager@email.com");
        $contributorId = self::$environ->createUser("contributor1", "contributor1", "contributor1@email.com");
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
        $this->assertEquals('the question', $dto['question']['title']);

        // Contributor cannot view Question of archived Text, throw Exception
        QuestionCommentDto::encode($project->id->asString(), $questionId, $contributorId);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    private function createProjectForTestingAnswerVisibility(): array
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) =
            CommonQuestionsAndAnswersForDto::createProjectForTestingAnswerVisibility(self::$environ);

        return [$projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id];
    }

    private function assertKeyNotPresent($key, $array)
    {
        if ($array instanceof stdClass) {
            // Skip assert since stdClass, by definition, has no keys, so this should be considered to succeed
        } else {
            $this->assertArrayNotHasKey($key, $array);
        }
    }
}
