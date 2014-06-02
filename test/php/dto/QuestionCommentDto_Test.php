<?php


use models\TextModel;

use models\scriptureforge\dto\QuestionCommentDto;

use models\CommentModel;

use models\AnswerModel;

use models\mapper\MongoStore;
use models\ProjectModel;
use models\UserModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/QuestionModel.php");


class TestQuestionCommentDto extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testEncode_FullQuestionWithAnswersAndComments_DtoReturnsExpectedData() {
		$e = new MongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		
		$text = new TextModel($project);
		$text->title = "Text 1";
		$usx = MongoTestEnvironment::usxSample();
		$text->content = $usx;
		$textId = $text->write();
		
		$user1Id = $e->createUser("user1", "user1", "user1@email.com");
		$user2Id = $e->createUser("user2", "user2", "user2@email.com");
		$user3Id = $e->createUser("user3", "user3", "user3@email.com");
		
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
}

?>
