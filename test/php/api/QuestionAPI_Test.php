<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestLibPath . 'jsonRPCClient.php');

class QuestionAPITestEnvironment
{
	/**
	 * @var jsonRPCClient
	 */
	private $_api;
	
	/**
	 * @var string
	 */
	private $_projectIdAdded;
	
	/**
	 * @var array
	 */
	private $_idAdded = array();
	
	function __construct() {
		$this->_api = new jsonRPCClient("http://scriptureforge.local/api/sf", false);
	}
	
	/**
	 * Creates a project 
	 * @param string $name
	 * @return projectId
	 */
	function createProject($name) {
		$model = array('id' => '', 'name' => $name);
		$this->_projectIdAdded = $this->_api->project_update($model);
		return $this->_projectIdAdded;
	}
	
	function createText($projectId, $title) {
		$model = array('id' => '', 'title' => $title);
		$textId = $this->_api->text_update($projectId, $model);
		return $textId;
	}
	
	function dispose() {
		$this->_api->project_delete(array($this->_projectIdAdded));
	}
}

class TestQuestionAPI extends UnitTestCase {

	function __construct() {
	}
	
	function testQuestionCRUD_CRUDOK() {
		$e = new QuestionAPITestEnvironment();
		$projectId = $e->createProject(SF_TESTPROJECT);
		$textId = $e->createText($projectId, 'Test Text 1');
		$api = new jsonRPCClient("http://scriptureforge.local/api/sf", false);
		
		// List
		$result = $api->question_list($projectId, $textId);
		$count = $result['count'];
		
		// Create
		$param = array(
			'id' => '',
			'title' =>'SomeQuestion',
			'description' =>'SomeDescription',
			'textRef' => $textId
		);
		$id = $api->question_update($projectId, $param);
		$this->assertNotNull($id);
		$this->assertEqual(24, strlen($id));
		
		// Read
		$result = $api->question_read($projectId, $id);
		$this->assertNotNull($result['id']);
		$this->assertEqual('SomeQuestion', $result['title']);
		
		// Update
		$result['title'] = 'OtherQuestion';
		$id = $api->question_update($projectId, $result);
		$this->assertNotNull($id);
		$this->assertEqual($result['id'], $id);
		
		// Read back
		$result = $api->question_read($projectId, $id);
		$this->assertEqual('OtherQuestion', $result['title']);
		
		// List
		$result = $api->question_list($projectId, $textId);
		$this->assertEqual($count + 1, $result['count']);
		
		// Delete
 		$result = $api->question_delete($projectId, array($id));
 		$this->assertTrue($result);

 		// List to confirm delete
 		$result = $api->question_list($projectId, $textId);
		$this->assertEqual($count, $result['count']);

		// Clean up after ourselves
		$e->dispose();
	}
	
}

?>
