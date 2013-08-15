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
	
	function testGetActivityForUser_MultipleProjects_DtoAsExpected() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project1 = $e->createProject(SF_TESTPROJECT);
		$project2 = $e->createProject(SF_TESTPROJECT2);
		
		$userId = $e->createUser("user1", "user1", "user1@email.com");
		$project1->addUser($userId);
		$project1->write();
		
		$project2->addUser($userId);
		$project2->write();
		
		$text1 = new TextModel($project1);
		$text1->title = "Text 1";
		$text1->content = "text content";
		$text1Id = $text1->write();
		ActivityCommands::addText($project1, $text1Id, $text1);
		
		$text2 = new TextModel($project2);
		$text2->title = "Text 2";
		$text2->content = "text content";
		$text2Id = $text1->write();
		ActivityCommands::addText($project2, $text2Id, $text2);
		
		$dto = ActivityListDto::getActivityForUser($userId);
		
		$this->assertEqual($dto[0]['action'], 'add_text');
		$this->assertEqual($dto[0]['projectRef'], $project1->id->asString());
		$this->assertEqual($dto[0]['content']['project'], $project1->projectname);
		$this->assertEqual($dto[0]['textRef'], $text1Id);
		$this->assertEqual($dto[0]['content']['text'], $text1->title);
		
		$this->assertEqual($dto[1]['action'], 'add_text');
		$this->assertEqual($dto[1]['projectRef'], $project2->id->asString());
		$this->assertEqual($dto[1]['content']['project'], $project2->projectname);
		$this->assertEqual($dto[1]['textRef'], $text2Id);
		$this->assertEqual($dto[1]['content']['text'], $text2->title);
		
		$e->clean();
		
	}
	
	function testGetActivityForProject_ProjectWithTextQuestionAnswerAndComments_DtoAsExpected() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
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
		ActivityCommands::addAnswer($project, $questionId, $answer);
		
		// Followed by comments
		$comment1 = new CommentModel();
		$comment1->content = "first comment";
		$comment1->userRef->id = $user1Id;
		$comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);
		ActivityCommands::addComment($project, $questionId, $answerId, $comment1);
		
		$comment2 = new CommentModel();
		$comment2->content = "second comment";
		$comment2->userRef->id = $user2Id;
		$comment2Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);
		ActivityCommands::addComment($project, $questionId, $answerId, $comment2);
		
		// updated answer
		$question->read($questionId);
		$answer_updated = $question->readAnswer($answerId);
		$answer_updated->content = "first answer revised";
		QuestionModel::writeAnswer($project->databaseName(), $questionId, $answer_updated);
		ActivityCommands::updateAnswer($project, $questionId, $answer_updated);
		
		// updated comment1
		$question->read($questionId);
		$comment1_updated = $question->readComment($answerId, $comment1Id);
		$comment1_updated->content = "first comment revised";
		QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1_updated);
		ActivityCommands::updateComment($project, $questionId, $answerId, $comment1_updated);
		
		
		$dto = ActivityListDto::getActivityForProject($project);
		
		$this->assertEqual($dto[0]['action'], 'add_text');
		$this->assertEqual($dto[0]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[0]['content']['project'], $project->projectname);
		$this->assertEqual($dto[0]['textRef'], $textId);
		$this->assertEqual($dto[0]['content']['text'], $text->title);
		
		$this->assertEqual($dto[1]['action'], 'add_user_to_project');
		$this->assertEqual($dto[1]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[1]['content']['project'], $project->projectname);
		$this->assertEqual($dto[1]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[1]['userRef']['username'], 'user1');
		$this->assertEqual($dto[1]['userRef']['avatar_ref'], 'user1.png');
		
		$this->assertEqual($dto[2]['action'], 'add_user_to_project');
		$this->assertEqual($dto[2]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[2]['content']['project'], $project->projectname);
		$this->assertEqual($dto[2]['userRef']['id'], $user2Id);
		$this->assertEqual($dto[2]['userRef']['username'], 'user2');
		$this->assertEqual($dto[2]['userRef']['avatar_ref'], 'user2.png');
		
		$this->assertEqual($dto[3]['action'], 'add_user_to_project');
		$this->assertEqual($dto[3]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[3]['content']['project'], $project->projectname);
		$this->assertEqual($dto[3]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[3]['userRef']['username'], 'user3');
		$this->assertEqual($dto[3]['userRef']['avatar_ref'], 'user3.png');
		
		$this->assertEqual($dto[4]['action'], 'add_question');
		$this->assertEqual($dto[4]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[4]['content']['project'], $project->projectname);
		$this->assertEqual($dto[4]['textRef'], $textId);
		$this->assertEqual($dto[4]['content']['text'], $text->title);
		$this->assertEqual($dto[4]['questionRef'], $questionId);
		$this->assertEqual($dto[4]['content']['question'], $question->title);
		
		$this->assertEqual($dto[5]['action'], 'add_answer');
		$this->assertEqual($dto[5]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[5]['content']['project'], $project->projectname);
		$this->assertEqual($dto[5]['textRef'], $textId);
		$this->assertEqual($dto[5]['content']['text'], $text->title);
		$this->assertEqual($dto[5]['questionRef'], $questionId);
		$this->assertEqual($dto[5]['content']['question'], $question->title);
		$this->assertEqual($dto[5]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[5]['userRef']['username'], 'user3');
		$this->assertEqual($dto[5]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[5]['content']['answer'], $answer->content);
		
		$this->assertEqual($dto[6]['action'], 'add_comment');
		$this->assertEqual($dto[6]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[6]['content']['project'], $project->projectname);
		$this->assertEqual($dto[6]['textRef'], $textId);
		$this->assertEqual($dto[6]['content']['text'], $text->title);
		$this->assertEqual($dto[6]['questionRef'], $questionId);
		$this->assertEqual($dto[6]['content']['question'], $question->title);
		$this->assertEqual($dto[6]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[6]['userRef']['username'], 'user1');
		$this->assertEqual($dto[6]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto[6]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[6]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[6]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[6]['content']['answer'], $answer->content);
		$this->assertEqual($dto[6]['content']['comment'], $comment1->content);
		
		$this->assertEqual($dto[7]['action'], 'add_comment');
		$this->assertEqual($dto[7]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[7]['content']['project'], $project->projectname);
		$this->assertEqual($dto[7]['textRef'], $textId);
		$this->assertEqual($dto[7]['content']['text'], $text->title);
		$this->assertEqual($dto[7]['questionRef'], $questionId);
		$this->assertEqual($dto[7]['content']['question'], $question->title);
		$this->assertEqual($dto[7]['userRef']['id'], $user2Id);
		$this->assertEqual($dto[7]['userRef']['username'], 'user2');
		$this->assertEqual($dto[7]['userRef']['avatar_ref'], 'user2.png');
		$this->assertEqual($dto[6]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[6]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[6]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[7]['content']['answer'], $answer->content);
		$this->assertEqual($dto[7]['content']['comment'], $comment2->content);
		
		$this->assertEqual($dto[8]['action'], 'update_answer');
		$this->assertEqual($dto[8]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[8]['content']['project'], $project->projectname);
		$this->assertEqual($dto[8]['textRef'], $textId);
		$this->assertEqual($dto[8]['content']['text'], $text->title);
		$this->assertEqual($dto[8]['questionRef'], $questionId);
		$this->assertEqual($dto[8]['content']['question'], $question->title);
		$this->assertEqual($dto[8]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[8]['userRef']['username'], 'user3');
		$this->assertEqual($dto[8]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[8]['content']['answer'], $answer_updated->content);
		
		$this->assertEqual($dto[9]['action'], 'update_comment');
		$this->assertEqual($dto[9]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[9]['content']['project'], $project->projectname);
		$this->assertEqual($dto[9]['textRef'], $textId);
		$this->assertEqual($dto[9]['content']['text'], $text->title);
		$this->assertEqual($dto[9]['questionRef'], $questionId);
		$this->assertEqual($dto[9]['content']['question'], $question->title);
		$this->assertEqual($dto[9]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[9]['userRef']['username'], 'user1');
		$this->assertEqual($dto[9]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto[6]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[6]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[6]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[9]['content']['answer'], $answer->content);
		$this->assertEqual($dto[9]['content']['comment'], $comment1_updated->content);
		
	}
}

?>
