<?php

use Api\Model\Scriptureforge\Dto\ProjectPageDto;
use Api\Model\AnswerModel;
use Api\Model\CommentModel;
use Api\Model\QuestionModel;
use Api\Model\TextModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestProjectPageDto extends UnitTestCase
{
    public function testEncode_TextWithQuestions_DtoReturnsExpectedData()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // Two texts, with different numbers of questions for each text and different create dates
        $text1 = new TextModel($project);
        $text1->title = "Chapter 3";
        $text1->content = "I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …";
        $text1->write();
        $text1->dateCreated->addSeconds(-date_interval_create_from_date_string('1 day')->s);
        $text1Id = $text1->write();

        $text2 = new TextModel($project);
        $text2->title = "Chapter 4";
        $text2->content = "We had gone perhaps ten miles when the ground began to rise very rapidly. …";
        $text2Id = $text2->write();

        // Answers are tied to specific users, so let's create some sample users
        $user1Id = $e->createUser("jcarter", "John Carter", "johncarter@example.com");
        $user2Id = $e->createUser("dthoris", "Dejah Thoris", "princess@example.com");

        // Two questions for text 1...
        $question1 = new QuestionModel($project);
        $question1->title = "Who is speaking?";
        $question1->description = "Who is telling the story in this text?";
        $question1->textRef->id = $text1Id;
        $question1->write();

        $question2 = new QuestionModel($project);
        $question2->title = "Where is the storyteller?";
        $question2->description = "The person telling this story has just arrived somewhere. Where is he?";
        $question2->textRef->id = $text1Id;
        $question2Id = $question2->write();

        // ... and one question for text 2.
        $question3 = new QuestionModel($project);
        $question3->title = "How far had they travelled?";
        $question3->description = "How far had the group just travelled when this text begins?";
        $question3->textRef->id = $text2Id;
        $question3->write();

        // One answer for question 1...
        $answer1 = new AnswerModel();
        $answer1->content = "Me, John Carter.";
        $answer1->score = 10;
        $answer1->userRef->id = $user1Id;
        $answer1->textHightlight = "I knew that I was on Mars";
        $question1->writeAnswer($answer1);

        // ... and two answers for question 2...
        $answer2 = new AnswerModel();
        $answer2->content = "On Mars.";
        $answer2->score = 1;
        $answer2->userRef->id = $user1Id;
        $answer2->textHightlight = "I knew that I was on Mars";
        $question2->writeAnswer($answer2);

        $answer3 = new AnswerModel();
        $answer3->content = "On the planet we call Barsoom, which you inhabitants of Earth normally call Mars.";
        $answer3->score = 7;
        $answer3->userRef->id = $user2Id;
        $answer3->textHightlight = "I knew that I was on Mars";
        $answer3Id = $question2->writeAnswer($answer3);

        // ... and 1 comment.
        $comment1 = new CommentModel();
        $comment1->content = "By the way, our name for Earth is Jasoom.";
        $comment1->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $question2Id, $answer3Id, $comment1);

        $dto = ProjectPageDto::encode($projectId, $user1Id);

        // Now check that it all looks right
        $this->assertIsA($dto['texts'], 'array');
        $this->assertEqual($dto['texts'][0]['id'], $text2Id);
        $this->assertEqual($dto['texts'][1]['id'], $text1Id);
        $this->assertEqual($dto['texts'][0]['title'], "Chapter 4");
        $this->assertEqual($dto['texts'][1]['title'], "Chapter 3");
        $this->assertEqual($dto['texts'][0]['questionCount'], 1);
        $this->assertEqual($dto['texts'][1]['questionCount'], 2);
        $this->assertEqual($dto['texts'][0]['responseCount'], 0);
        $this->assertEqual($dto['texts'][1]['responseCount'], 4);

        // archive 1 Question
        $question2->isArchived = true;
        $question2->write();

        $dto = ProjectPageDto::encode($projectId, $user1Id);

        $this->assertEqual($dto['texts'][0]['questionCount'], 1);
        $this->assertEqual($dto['texts'][1]['questionCount'], 1);
        $this->assertEqual($dto['texts'][0]['responseCount'], 0);
        $this->assertEqual($dto['texts'][1]['responseCount'], 1);
    }

}
