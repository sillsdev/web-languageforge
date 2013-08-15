<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllDtoTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'dto/QuestionCommentDto_Test.php');
 		$this->addFile(TestPath . 'dto/ActivityDto_Test.php');
		$this->addFile(TestPath . 'dto/ProjectListDto_Test.php');
		$this->addFile(TestPath . 'dto/TextListDto_Test.php');
		$this->addFile(TestPath . 'dto/QuestionListDto_Test.php');
    }

}

?>
