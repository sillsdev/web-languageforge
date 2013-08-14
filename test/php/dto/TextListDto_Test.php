<?php


use models\dto\TextListDto;

use models\TextModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestTextListDto extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testEncode_TextWithQuestions_DtoReturnsExpectedData() {
		$e = new MongoTestEnvironment();

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();

		// Two texts, with different numbers of questions for each text
		$text1 = new TextModel($project);
		$text1->title = "Chapter 3";
		$text1->content = "I opened my eyes upon a strange and weird landscape. I knew that I was on Mars; …";
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
		$question1Id = $question1->write();

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
		$question3Id = $question3->write();

		$dto = TextListDto::encode($projectId);

		// Now check that it all looks right
		$this->assertEqual($dto['count'], 2);
		$this->assertIsa($dto['entries'], 'array');
		$this->assertEqual($dto['entries'][0]['id'], $text1Id);
		$this->assertEqual($dto['entries'][1]['id'], $text2Id);
		// The rest should fail... for now.
		$this->assertEqual($dto['entries'][0]['title'], "Chapter 3");
		$this->assertEqual($dto['entries'][1]['title'], "Chapter 4");
		$this->assertEqual($dto['entries'][0]['questionCount'], 2);
		$this->assertEqual($dto['entries'][1]['questionCount'], 1);

	}

}

?>
