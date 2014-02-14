<?php
use \libraries\lfdictionary\dto\ProjectDTO;
use \libraries\lfdictionary\dto\ProjectListDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

require_once(dirname(__FILE__) . '/../MockObject/AllMockObjects.php');

class TestOfProjectDTO extends UnitTestCase {

	function testEncode_ListAddProject_JsonCorrect() {
		$project = new ProjectDTO(new ProjectModelMockObject());
			
		$result = json_encode($project->encode());
		$this->assertEqual('{"id":1,"name":"name","title":"title","type":"dictionary","lang":"fr"}', $result);
		
		$ProjectListDTO = new ProjectListDTO();
		$ProjectListDTO->addListProject($project);
		$result = json_encode($ProjectListDTO->encode());
		
		$this->assertEqual('{"List":[{"id":1,"name":"name","title":"title","type":"dictionary","lang":"fr"}]}', $result);
	}
}

?>