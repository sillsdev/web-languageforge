<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllApiTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'api/UserAPI_Test.php');
 		$this->addFile(TestPath . 'api/ProjectAPI_Test.php');
 		$this->addFile(TestPath . 'api/TextAPI_Test.php');
  		$this->addFile(TestPath . 'api/QuestionAPI_Test.php');
		$this->addFile(TestPath . 'api/QuestionTemplateAPI_Test.php');
    }

}

?>
