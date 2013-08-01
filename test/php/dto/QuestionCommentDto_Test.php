<?php


use models\TextModel;

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
		
		$project = $e->createProject("testProject");
		
		$text = new TextModel($project);
		$text->title = "Text 1";
		$text->content = "text content";
		$textId = $text->write();
		
		$user1Id = $e->createUser("user1", "user1", "user1@email.com");
		$user2Id = $e->createUser("user2", "user2", "user2@email.com");
		$user3Id = $e->createUser("user3", "user3", "user3@email.com");
		
		$comment1 = new CommentModel();
		$comment1->content = "first comment";
		$comment1->userRef->id = $user1Id;
		
		$comment2 = new CommentModel();
		$comment2->content = "second comment";
		$comment2->userRef->id = $user2Id;
		
		$answer = new AnswerModel();
		$answer->content = "first answer";
		$answer->score = 10;
		$answer->userRef->id = $user3Id;
		$answer->textHightlight = "text highlight";
		$answer->comments->data[] = $comment1;
		$answer->comments->data[] = $comment2;
		
		$question = new QuestionModel($project);
		$question->title = "the question";
		$question->description = "question description";
		$question->answers->data[] = $answer;
		$question->textRef->id = $textId;
		$questionId = $question->write();
		
		$dto = QuestionCommentDto::encode($project->id->asString(), $questionId);
		
		$this->assertEqual($dto['projectid'], $project->id);
		$this->assertEqual($dto['text']['content'], $text->content);
		$this->assertEqual($dto['question']['id'], $questionId);
		$this->assertEqual($dto['question']['title'], 'the question');
		$this->assertEqual($dto['question']['description'], 'question description');
		$this->assertEqual($dto['question']['answers'][0]['content'], 'first answer');
		$this->assertEqual($dto['question']['answers'][0]['score'], 10);
		$this->assertEqual($dto['question']['answers'][0]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto['question']['answers'][0]['userRef']['username'], 'user3');
		$this->assertEqual($dto['question']['answers'][0]['comments'][0]['content'], 'first comment');
		$this->assertEqual($dto['question']['answers'][0]['comments'][0]['userRef']['username'], 'user1');
		$this->assertEqual($dto['question']['answers'][0]['comments'][0]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto['question']['answers'][0]['comments'][1]['content'], 'second comment');
		$this->assertEqual($dto['question']['answers'][0]['comments'][1]['userRef']['username'], 'user2');
		$this->assertEqual($dto['question']['answers'][0]['comments'][1]['userRef']['avatar_ref'], 'user2.png');
	}
}

?>
