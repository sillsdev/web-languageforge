<?php

use models\commands\SessionCommands;
use models\commands\ProjectCommands;
//use models\AnswerModel;
//use models\CommentModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class SessionTestEnvironment {
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
	public $questionId;

	/**
	 * @var string
	 */
	public $userId;
	
	public $website;

	public function create() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$this->website = $e->website;
	
		$this->project = $e->createProject(SF_TESTPROJECT);
		$this->project->appName = 'sfchecks';
		$this->project->write();
		$this->question = new QuestionModel($this->project);
		$this->question->write();
	
		$this->userId = $e->createUser('test_user', 'Test User', 'test_user@example.com');
		$this->projectId = $this->project->id->asString();
		$this->questionId = $this->question->id->asString();
	}

}

class TestSessionCommands extends UnitTestCase {
	function testSessionData_userIsNotPartOfProject() {
		$e = new SessionTestEnvironment();
		$e->create();
		$data = SessionCommands::getSessionData($e->projectId, $e->userId, $e->website);

		// Session data should contain a userId and projectId
		$this->assertTrue(array_key_exists('userId', $data));
		$this->assertTrue(is_string($data['userId']));
		$this->assertEqual($data['userId'], $e->userId);
		$this->assertTrue(array_key_exists('projectId', $data));
		$this->assertTrue(is_string($data['projectId']));
		$this->assertEqual($data['projectId'], $e->projectId);

		// Session data should also contain "site", a string...
		$this->assertTrue(array_key_exists('baseSite', $data));
		$this->assertTrue(is_string($data['baseSite']));
		// ... and "fileSizeMax", an integer
		$this->assertTrue(array_key_exists('fileSizeMax', $data));
		$this->assertTrue(is_integer($data['fileSizeMax']));

		// Session data should contain project settings, an associative array
		$this->assertTrue(array_key_exists('projectSettings', $data));
		$this->assertTrue(is_array($data['projectSettings']));
		// ... which should not be empty
		$this->assertFalse(empty($data['projectSettings']));

		// Session data should contain user site rights, an array of integers
		$this->assertTrue(array_key_exists('userSiteRights', $data));
		$this->assertTrue(is_array($data['userSiteRights']));
		// ... which should not be empty
		$this->assertFalse(empty($data['userSiteRights']));
		$this->assertTrue(is_integer($data['userSiteRights'][0]));

		// Session data should contain user project rights, an array of integers
		$this->assertTrue(array_key_exists('userProjectRights', $data));
		$this->assertTrue(is_array($data['userProjectRights']));
		// ... which should be empty at first when the user is not part of the project
		$this->assertTrue(empty($data['userProjectRights']));
	}
	
	function testSessionData_userIsPartOfProject() {
		$e = new SessionTestEnvironment();
		$e->create();
		ProjectCommands::updateUserRole($e->projectId, $e->userId);
		$data = SessionCommands::getSessionData($e->projectId, $e->userId, $e->website);

		// Session data should contain user project rights, an array of integers
		$this->assertTrue(array_key_exists('userProjectRights', $data));
		$this->assertTrue(is_array($data['userProjectRights']));
		// ... which should not be empty once the user has been assigned to the project
		$this->assertFalse(empty($data['userProjectRights']));
		$this->assertTrue(is_integer($data['userProjectRights'][0]));
	}
};

?>
