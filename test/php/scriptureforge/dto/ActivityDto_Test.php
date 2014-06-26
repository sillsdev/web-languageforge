<?php

use models\scriptureforge\dto\QuestionCommentDto;
use models\commands\ActivityCommands;
use models\shared\dto\ActivityListDto;
use models\shared\rights\ProjectRoles;
use models\mapper\MongoStore;
use models\AnswerModel;
use models\CommentModel;
use models\ProjectModel;
use models\QuestionModel;
use models\TextModel;
use models\UserModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestActivityDto extends UnitTestCase {

	function testGetActivityForProject_DeletedUser_DtoAsExpected() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		
		$text = new TextModel($project);
		$text->title = "Text 1";
		$text->content = "text content";
		$textId = $text->write();
		ActivityCommands::addText($project, $textId, $text);
		
		$userId = $e->createUser("user1", "user1", "user1@email.com");
		ActivityCommands::addUserToProject($project, $userId);
		
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
		$answer->userRef->id = $userId;
		$answer->textHightlight = "text highlight";
		$answerId = $question->writeAnswer($answer);
		$activityid = ActivityCommands::addAnswer($project, $questionId, $answer);
		
		// now delete the user
		$user = new UserModel($userId);
		$user->remove();
		
		$dto = ActivityListDto::getActivityForProject($project);
		
		$this->assertEqual($dto[$activityid]['action'], 'add_answer');
		$this->assertEqual($dto[$activityid]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$activityid]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$activityid]['textRef'], $textId);
		$this->assertEqual($dto[$activityid]['content']['text'], $text->title);
		$this->assertEqual($dto[$activityid]['questionRef'], $questionId);
		$this->assertEqual($dto[$activityid]['content']['question'], $question->title);
		$this->assertEqual($dto[$activityid]['content']['answer'], $answer->content);
		$this->assertEqual($dto[$activityid]['userRef'], '');
		$this->assertEqual($dto[$activityid]['content']['user'], 'user1');
	}
	
	function testGetActivityForUser_MultipleProjects_DtoAsExpected() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project1 = $e->createProject(SF_TESTPROJECT);
		$project2 = $e->createProject(SF_TESTPROJECT2);
		
		$userId = $e->createUser("user1", "user1", "user1@email.com");
		$project1->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$project1->write();
		
		$project2->addUser($userId, ProjectRoles::CONTRIBUTOR);
		$project2->write();
		
		$text1 = new TextModel($project1);
		$text1->title = "Text 1";
		$text1->content = "text content";
		$text1Id = $text1->write();
		$a1 = ActivityCommands::addText($project1, $text1Id, $text1);
		
		$text2 = new TextModel($project2);
		$text2->title = "Text 2";
		$text2->content = "text content";
		$text2Id = $text2->write();
		$a2 = ActivityCommands::addText($project2, $text2Id, $text2);
		
		$dto = ActivityListDto::getActivityForUser($project1->siteName, $userId);
		$dto = $dto['activity'];
		
		$this->assertEqual($dto[$a1]['action'], 'add_text');
		$this->assertEqual($dto[$a1]['projectRef'], $project1->id->asString());
		$this->assertEqual($dto[$a1]['content']['project'], $project1->projectName);
		$this->assertEqual($dto[$a1]['textRef'], $text1Id);
		$this->assertEqual($dto[$a1]['content']['text'], $text1->title);
		
		$this->assertEqual($dto[$a2]['action'], 'add_text');
		$this->assertEqual($dto[$a2]['projectRef'], $project2->id->asString());
		$this->assertEqual($dto[$a2]['content']['project'], $project2->projectName);
		$this->assertEqual($dto[$a2]['textRef'], $text2Id);
		$this->assertEqual($dto[$a2]['content']['text'], $text2->title);
		
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
		$a1 = ActivityCommands::addText($project, $textId, $text);
		
		$user1Id = $e->createUser("user1", "user1", "user1@email.com");
		$user2Id = $e->createUser("user2", "user2", "user2@email.com");
		$user3Id = $e->createUser("user3", "user3", "user3@email.com");
		$a2 = ActivityCommands::addUserToProject($project, $user1Id);
		$a3 = ActivityCommands::addUserToProject($project, $user2Id);
		$a4 = ActivityCommands::addUserToProject($project, $user3Id);
		
		// Workflow is first to create a question
		$question = new QuestionModel($project);
		$question->title = "the question";
		$question->description = "question description";
		$question->textRef->id = $textId;
		$questionId = $question->write();
		$a5 = ActivityCommands::addQuestion($project, $questionId, $question);
		
		// Then to add an answer to a question
		$answer = new AnswerModel();
		$answer->content = "first answer";
		$answer->score = 10;
		$answer->userRef->id = $user3Id;
		$answer->textHightlight = "text highlight";
		$answerId = $question->writeAnswer($answer);
		$a6 = ActivityCommands::addAnswer($project, $questionId, $answer);
		
		// Followed by comments
		$comment1 = new CommentModel();
		$comment1->content = "first comment";
		$comment1->userRef->id = $user1Id;
		$comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);
		$a7 = ActivityCommands::addComment($project, $questionId, $answerId, $comment1);
		
		$comment2 = new CommentModel();
		$comment2->content = "second comment";
		$comment2->userRef->id = $user2Id;
		$comment2Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);
		$a8 = ActivityCommands::addComment($project, $questionId, $answerId, $comment2);
		
		// updated answer
		$question->read($questionId);
		$answer_updated = $question->readAnswer($answerId);
		$answer_updated->content = "first answer revised";
		$question->writeAnswer($answer_updated);
		$a9 = ActivityCommands::updateAnswer($project, $questionId, $answer_updated);
		
		// updated comment1
		$question->read($questionId);
		$comment1_updated = $question->readComment($answerId, $comment1Id);
		$comment1_updated->content = "first comment revised";
		QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1_updated);
		$a10 = ActivityCommands::updateComment($project, $questionId, $answerId, $comment1_updated);
		
		$dto = ActivityListDto::getActivityForProject($project);
		
		$this->assertEqual($dto[$a1]['action'], 'add_text');
		$this->assertEqual($dto[$a1]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a1]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a1]['textRef'], $textId);
		$this->assertEqual($dto[$a1]['content']['text'], $text->title);
		
		$this->assertEqual($dto[$a2]['action'], 'add_user_to_project');
		$this->assertEqual($dto[$a2]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a2]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a2]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[$a2]['userRef']['username'], 'user1');
		$this->assertEqual($dto[$a2]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto[$a2]['content']['user'], 'user1');
		
		$this->assertEqual($dto[$a3]['action'], 'add_user_to_project');
		$this->assertEqual($dto[$a3]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a3]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a3]['userRef']['id'], $user2Id);
		$this->assertEqual($dto[$a3]['userRef']['username'], 'user2');
		$this->assertEqual($dto[$a3]['userRef']['avatar_ref'], 'user2.png');
		$this->assertEqual($dto[$a3]['content']['user'], 'user2');
		
		$this->assertEqual($dto[$a4]['action'], 'add_user_to_project');
		$this->assertEqual($dto[$a4]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a4]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a4]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[$a4]['userRef']['username'], 'user3');
		$this->assertEqual($dto[$a4]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a4]['content']['user'], 'user3');
		
		$this->assertEqual($dto[$a5]['action'], 'add_question');
		$this->assertEqual($dto[$a5]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a5]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a5]['textRef'], $textId);
		$this->assertEqual($dto[$a5]['content']['text'], $text->title);
		$this->assertEqual($dto[$a5]['questionRef'], $questionId);
		$this->assertEqual($dto[$a5]['content']['question'], $question->title);
		
		$this->assertEqual($dto[$a6]['action'], 'add_answer');
		$this->assertEqual($dto[$a6]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a6]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a6]['textRef'], $textId);
		$this->assertEqual($dto[$a6]['content']['text'], $text->title);
		$this->assertEqual($dto[$a6]['questionRef'], $questionId);
		$this->assertEqual($dto[$a6]['content']['question'], $question->title);
		$this->assertEqual($dto[$a6]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[$a6]['userRef']['username'], 'user3');
		$this->assertEqual($dto[$a6]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a6]['content']['answer'], $answer->content);
		$this->assertEqual($dto[$a6]['content']['user'], 'user3');
		
		$this->assertEqual($dto[$a7]['action'], 'add_comment');
		$this->assertEqual($dto[$a7]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a7]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a7]['textRef'], $textId);
		$this->assertEqual($dto[$a7]['content']['text'], $text->title);
		$this->assertEqual($dto[$a7]['questionRef'], $questionId);
		$this->assertEqual($dto[$a7]['content']['question'], $question->title);
		$this->assertEqual($dto[$a7]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[$a7]['userRef']['username'], 'user1');
		$this->assertEqual($dto[$a7]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto[$a7]['content']['user'], 'user1');
		$this->assertEqual($dto[$a7]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[$a7]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[$a7]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a7]['content']['user2'], 'user3');
		$this->assertEqual($dto[$a7]['content']['answer'], $answer->content);
		$this->assertEqual($dto[$a7]['content']['comment'], $comment1->content);
		
		$this->assertEqual($dto[$a8]['action'], 'add_comment');
		$this->assertEqual($dto[$a8]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a8]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a8]['textRef'], $textId);
		$this->assertEqual($dto[$a8]['content']['text'], $text->title);
		$this->assertEqual($dto[$a8]['questionRef'], $questionId);
		$this->assertEqual($dto[$a8]['content']['question'], $question->title);
		$this->assertEqual($dto[$a8]['userRef']['id'], $user2Id);
		$this->assertEqual($dto[$a8]['userRef']['username'], 'user2');
		$this->assertEqual($dto[$a8]['userRef']['avatar_ref'], 'user2.png');
		$this->assertEqual($dto[$a8]['content']['user'], 'user2');
		$this->assertEqual($dto[$a8]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[$a8]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[$a8]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a8]['content']['user2'], 'user3');
		$this->assertEqual($dto[$a8]['content']['answer'], $answer->content);
		$this->assertEqual($dto[$a8]['content']['comment'], $comment2->content);
		
		$this->assertEqual($dto[$a9]['action'], 'update_answer');
		$this->assertEqual($dto[$a9]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a9]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a9]['textRef'], $textId);
		$this->assertEqual($dto[$a9]['content']['text'], $text->title);
		$this->assertEqual($dto[$a9]['questionRef'], $questionId);
		$this->assertEqual($dto[$a9]['content']['question'], $question->title);
		$this->assertEqual($dto[$a9]['userRef']['id'], $user3Id);
		$this->assertEqual($dto[$a9]['userRef']['username'], 'user3');
		$this->assertEqual($dto[$a9]['userRef']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a9]['content']['user'], 'user3');
		$this->assertEqual($dto[$a9]['content']['answer'], $answer_updated->content);
		
		$this->assertEqual($dto[$a10]['action'], 'update_comment');
		$this->assertEqual($dto[$a10]['projectRef'], $project->id->asString());
		$this->assertEqual($dto[$a10]['content']['project'], $project->projectName);
		$this->assertEqual($dto[$a10]['textRef'], $textId);
		$this->assertEqual($dto[$a10]['content']['text'], $text->title);
		$this->assertEqual($dto[$a10]['questionRef'], $questionId);
		$this->assertEqual($dto[$a10]['content']['question'], $question->title);
		$this->assertEqual($dto[$a10]['userRef']['id'], $user1Id);
		$this->assertEqual($dto[$a10]['userRef']['username'], 'user1');
		$this->assertEqual($dto[$a10]['userRef']['avatar_ref'], 'user1.png');
		$this->assertEqual($dto[$a10]['content']['user'], 'user1');
		$this->assertEqual($dto[$a10]['userRef2']['id'], $user3Id);
		$this->assertEqual($dto[$a10]['userRef2']['username'], 'user3');
		$this->assertEqual($dto[$a10]['userRef2']['avatar_ref'], 'user3.png');
		$this->assertEqual($dto[$a10]['content']['user2'], 'user3');
		$this->assertEqual($dto[$a10]['content']['answer'], $answer_updated->content);
		$this->assertEqual($dto[$a10]['content']['comment'], $comment1_updated->content);
	}
}

?>
