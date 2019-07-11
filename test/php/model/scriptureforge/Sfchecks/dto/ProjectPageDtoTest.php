<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\Dto\ProjectPageDto;
use Api\Model\Scriptureforge\Sfchecks\SfchecksProjectModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use Api\Model\Shared\ProjectModel;
use PHPUnit\Framework\TestCase;

require_once "CommonQuestionsAndAnswersForDto.php";

class ProjectPageDtoTest extends TestCase
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

    public function testEncode_TextWithOneArchivedQuestion_DoesNotIncludeArchivedQuestionInDto()
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) = $this->createProjectForTestingResponseCountOnProjectPage();

        // archive 1 Question
        $project = new ProjectModel($projectId);
        $question2 = new QuestionModel($project, $question2Id);
        $question2->isArchived = true;
        $question2->write();

        $dto = ProjectPageDto::encode($projectId, $user1Id);
        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];

        $this->assertEquals(1, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(1, $encodedText1['responseCount']);
        $this->assertEquals(0, $encodedText2['responseCount']);
    }

    public function testEncode_TextWithQuestionsWhenUsersCanViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) = $this->createProjectForTestingResponseCountOnProjectPage();

        $dto = ProjectPageDto::encode($projectId, $user1Id);
        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];

        $this->assertEquals(2, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(6, $encodedText1['responseCount']);
        $this->assertEquals(0, $encodedText2['responseCount']);
    }

    public function testEncode_TextWithQuestionsWhenUsersCannotViewEachOthersAnswers_DtoReturnsExpectedData()
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id) = $this->createProjectForTestingResponseCountOnProjectPage();

        $sfchecksProject = new SfchecksProjectModel($projectId);
        $sfchecksProject->usersSeeEachOthersResponses = false;
        $sfchecksProject->write();

        // User 1 (John Carter)'s point of view (he's a contributor)
        $dto = ProjectPageDto::encode($projectId, $user1Id);
        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];

        $this->assertEquals(2, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(3, $encodedText1['responseCount']); // 2 answers, just 1 comment (he won't see his comment on Dejah Thoris's answer)
        $this->assertEquals(0, $encodedText2['responseCount']);

        // User 2 (Dejah Thoris)'s point of view (she's a contributor)
        $dto = ProjectPageDto::encode($projectId, $user2Id);
        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];

        $this->assertEquals(2, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(2, $encodedText1['responseCount']); // 1 answer and 1 comment on her own answer (she won't see John Carter's comment)
        $this->assertEquals(0, $encodedText2['responseCount']);

        // User 3 (Tars Tarkas)'s point of view (he's a project manager)
        $dto = ProjectPageDto::encode($projectId, $user3Id);
        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];
        $this->assertEquals(2, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(6, $encodedText1['responseCount']); // total of 3 answers, 3 comments (managers are not affected by the setting)
        $this->assertEquals(0, $encodedText2['responseCount']);
    }

    /**
     * @return array
     */
    private function createProjectForTestingResponseCountOnProjectPage(): array
    {
        list($projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id) =
            CommonQuestionsAndAnswersForDto::createProjectForTestingAnswerVisibility(self::$environ);

        // Now check that it all looks right
        $dto = ProjectPageDto::encode($projectId, $user1Id);

        $encodedTexts = MongoTestEnvironment::indexItemsBy($dto['texts'], 'id');
        $encodedText1 = $encodedTexts[$text1Id];
        $encodedText2 = $encodedTexts[$text2Id];

        $this->assertIsArray($dto['texts']);
        $this->assertEquals($text1Id, $encodedText1['id']);
        $this->assertEquals($text2Id, $encodedText2['id']);
        $this->assertEquals('Chapter 3', $encodedText1['title']);
        $this->assertEquals('Chapter 4', $encodedText2['title']);
        $this->assertEquals(2, $encodedText1['questionCount']);
        $this->assertEquals(1, $encodedText2['questionCount']);
        $this->assertEquals(6, $encodedText1['responseCount']);
        $this->assertEquals(0, $encodedText2['responseCount']);

        return [$projectId, $text1Id, $text2Id, $user1Id, $user2Id, $user3Id, $answer1Id, $answer2Id, $answer3Id, $question1Id, $question2Id, $comment0Id, $comment1Id, $comment2Id];
    }
}
