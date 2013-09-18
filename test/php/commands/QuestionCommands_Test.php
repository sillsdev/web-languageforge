<?php

use models\commands\QuestionCommands;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class UserVoteTestEnvironment {
	
	/**
	 * @var ProjectModel
	 */
	public $project;
	
	/**
	 * @var string
	 */
	public $projectId;
	
	/**
	 * @var QuestionModel
	 */
	public $question;
	
	/**
	 * @var string
	 */
	public $answerId;
	
	/**
	 * @var string
	 */
	public $questionId;
	
	public function create() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$this->project = $e->createProject(SF_TESTPROJECT);
		$this->question = new QuestionModel($this->project);
		$this->question->write();
		
		$this->userId = $e->createUser('test_user', 'Test User', 'test_user@example.com');
		$this->projectId = $this->project->id->asString();
		$this->questionId = $this->question->id->asString();
	}
	
	public function addAnswer($content) {
		$object = array();
		$object['id'] = '';
		$object['content'] = $content;
		$dto = QuestionCommands::updateAnswer($this->projectId, $this->questionId, $object, $this->userId);
		$keys = array_keys($dto);
		$this->answerId = $keys[0];
		return $dto;
	}
}

class TestQuestionCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testDeleteQuestions_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
				
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$question = new QuestionModel($project);
		$question->write();
		
		$questionId = $question->id->asString();
		QuestionCommands::deleteQuestions($projectId, array($questionId));
		
	}
	
	function testVoteUp_NoVotesThenUpAndDown_VoteGoesUpAndDown() {
		$e = new UserVoteTestEnvironment();
		$e->create();
		
		$dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);
		
		$answer0 = $dto[$e->answerId];
		$this->assertEqual(0, $answer0['score']);
		
 		$dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
//  	var_dump($dto, $e->answerId);
 			
 		$answer1 = $dto[$e->answerId];
 		$this->assertEqual(1, $answer1['score']);
 			
 		$dto = QuestionCommands::voteDown($e->userId, $e->projectId, $e->questionId, $e->answerId);
 //  	var_dump($dto, $e->answerId);
 		 	
		$answer2 = $dto[$e->answerId];
 		$this->assertEqual(0, $answer2['score']);
	}
	
	function testVoteUp_TwoVotes_NoChange() {
		$mte = new MongoTestEnvironment();
		$e = new UserVoteTestEnvironment();
		$e->create();
		
		$dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);
		
		$answer0 = $dto[$e->answerId];
		$this->assertEqual(0, $answer0['score']);
		
		$dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);

		$dto = QuestionCommands::voteUp($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 		var_dump($dto, $e->answerId);
		
		$answer1 = $dto[$e->answerId];
		$this->assertEqual(1, $answer1['score']);
	}
	
	function testVoteDown_NoVote_NoChange() {
		$e = new UserVoteTestEnvironment();
		$e->create();
		
		$dto = $e->addAnswer('Some answer');
// 		var_dump($dto, $e->answerId);
		
		$answer0 = $dto[$e->answerId];
		$this->assertEqual(0, $answer0['score']);
		
		$dto = QuestionCommands::voteDown($e->userId, $e->projectId, $e->questionId, $e->answerId);
// 	 	var_dump($dto, $e->answerId);
		$this->assertIsA($dto, 'array');
		
		$answer1 = $dto[$e->answerId];
		$this->assertEqual(0, $answer1['score']);
	}
	
}

?>