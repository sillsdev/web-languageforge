<?php


use models\dto\QuestionCommentDto;

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
		$user1Id = $e->createUser("user1", "user1", "user1@email.com");
		$user1 = new UserModel($user1Id);
		$user1->avatar_ref = "avatar1.png";
		$user1->write();
		
		$user2Id = $e->createUser("user2", "user2", "user2@email.com");
		$user2 = new UserModel($user2Id);
		$user2->avatar_ref = "avatar2.png";
		$user2->write();
		
		$user3Id = $e->createUser("user3", "user3", "user3@email.com");
		$user3 = new UserModel($user3Id);
		$user3->avatar_ref = "avatar3.png";
		$user3->write();
		
		$comment1 = new CommentModel();
		$comment1->content = "first comment";
		$comment1->textRef = "textRef1";
		$comment1->userId = $user1Id;
		
		$comment2 = new CommentModel();
		$comment2->content = "second comment";
		$comment2->textRef = "textRef2";
		$comment2->userId = $user2Id;
		
		$answer = new AnswerModel();
		$answer->content = "first answer";
		$answer->score = 10;
		$answer->userId = $user3Id;
		$answer->comments->data[] = $comment1;
		$answer->comments->data[] = $comment2;
		
		$project = $e->createProject("testProject");
		$question = new QuestionModel($project);
		$question->title = "the question";
		$question->description = "question description";
		$question->answers->data[] = $answer;
		$questionId = $question->write();
		
		$dto = QuestionCommentDto::encode($project->id, $questionId);
		
		$this->assertEqual($dto['projectid'], $project->id);
		$this->assertEqual($dto['questionid'], $questionId);
		$this->assertEqual($dto['title'], 'the question');
		$this->assertEqual($dto['description'], 'question description');
		$this->assertEqual($dto['answers'][0]['content'], 'first answer');
		$this->assertEqual($dto['answers'][0]['score'], 10);
		$this->assertEqual($dto['answers'][0]['avatar_ref'], 'avatar3.png');
		$this->assertEqual($dto['answers'][0]['by'], 'user3');
		$this->assertEqual($dto['answers'][0]['comments'][0]['content'], 'first comment');
		$this->assertEqual($dto['answers'][0]['comments'][0]['text_ref'], 'textRef1');
		$this->assertEqual($dto['answers'][0]['comments'][0]['by'], 'user1');
		$this->assertEqual($dto['answers'][0]['comments'][0]['avatar_ref'], 'avatar1.png');
		$this->assertEqual($dto['answers'][0]['comments'][1]['content'], 'second comment');
		$this->assertEqual($dto['answers'][0]['comments'][1]['text_ref'], 'textRef2');
		$this->assertEqual($dto['answers'][0]['comments'][1]['by'], 'user2');
		$this->assertEqual($dto['answers'][0]['comments'][1]['avatar_ref'], 'avatar2.png');
	}
}

?>
