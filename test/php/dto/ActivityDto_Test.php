<?php


use models\commands\ActivityCommands;

use models\dto\ActivityListDto;

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

/*
require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/QuestionModel.php");
*/


class TestActivityDto extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testGetActivityForProject_ProjectWithTextQuestionAnswerAndComments_DtoAsExpected() {
		$e = new MongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		
		$text = new TextModel($project);
		$text->title = "Text 1";
		$text->content = "text content";
		$textId = $text->write();
		ActivityCommands::addText($project, $textId, $text);
		
		$user1Id = $e->createUser("user1", "user1", "user1@email.com");
		$user2Id = $e->createUser("user2", "user2", "user2@email.com");
		$user3Id = $e->createUser("user3", "user3", "user3@email.com");
		ActivityCommands::addUserToProject($project, $user1Id);
		ActivityCommands::addUserToProject($project, $user2Id);
		ActivityCommands::addUserToProject($project, $user3Id);
		
		// Workflow is first to create a question
		$question = new QuestionModel($project);
		$question->title = "the question";
		$question->description = "question description";
		$question->textRef->id = $textId;
		$questionId = $question->write();
		ActivityCommands::addQuestion($project, $questionId, $question);
		
		// Then to add an answer to a question
		$answer = new AnswerModel();
		$answer->content = "first answer";
		$answer->score = 10;
		$answer->userRef->id = $user3Id;
		$answer->textHightlight = "text highlight";
		$answerId = QuestionModel::writeAnswer($project->databaseName(), $questionId, $answer);
		ActivityCommands::updateAnswer($project, $questionId, $answer);
		
		// Followed by comments
		$comment1 = new CommentModel();
		$comment1->content = "first comment";
		$comment1->userRef->id = $user1Id;
		$comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);
		ActivityCommands::updateComment($project, $questionId, $answerId, $comment1);
		
		$comment2 = new CommentModel();
		$comment2->content = "second comment";
		$comment2->userRef->id = $user2Id;
		$comment2Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);
		ActivityCommands::updateComment($project, $questionId, $answerId, $comment2);
		
		$dto = ActivityListDto::getActivityForProject($project);
		var_dump($dto);
		
		/*
		$aid = $answerId;
		$cid1 = $comment1Id;
		$cid2 = $comment2Id;
		$this->assertEqual($dto['projectid'], $project->id);
		$this->assertEqual($dto['text']['content'], $text->content);
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
		*/
	}
}

?>
