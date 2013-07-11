<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestLibPath . 'jsonRPCClient.php');

class TextAPITestEnvironment
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
	
	function dispose() {
		$this->_api->project_delete($this->_projectIdAdded);
	}
}

class TestTextAPI extends UnitTestCase {

	function __construct() {
	}
	
	function testTextCRUD_CRUDOK() {
		$e = new TextAPITestEnvironment();
		$projectId = $e->createProject(SF_TESTPROJECT);
		$api = new jsonRPCClient("http://scriptureforge.local/api/sf", false);
		
		// List
		$result = $api->text_list($projectId);
		$count = $result['count'];
		
		// Create
		$param = array(
			'id' => '',
			'title' =>'SomeText'
		);
		$id = $api->text_update($projectId, $param);
		$this->assertNotNull($id);
		$this->assertEqual(24, strlen($id));
		
		// Read
		$result = $api->text_read($projectId, $id);
		$this->assertNotNull($result['id']);
		$this->assertEqual('SomeText', $result['title']);
		
		// Update
		$result['title'] = 'OtherText';
		$id = $api->text_update($projectId, $result);
		$this->assertNotNull($id);
		$this->assertEqual($result['id'], $id);
		
		// Read back
		$result = $api->text_read($projectId, $id);
		$this->assertEqual('OtherText', $result['title']);
		
		// List
		$result = $api->text_list($projectId);
		$this->assertEqual($count + 1, $result['count']);
		
		// Delete
 		$result = $api->text_delete($projectId, array($id));
 		$this->assertTrue($result);

 		// List to confirm delete
 		$result = $api->text_list($projectId);
		$this->assertEqual($count, $result['count']);
	}
	
}

?>