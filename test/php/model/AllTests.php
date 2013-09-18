<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllModelTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
 		$this->addFile(TestPath . 'model/UserModel_Test.php');
 		$this->addFile(TestPath . 'model/ProjectModel_Test.php');
 		$this->addFile(TestPath . 'model/MultipleModel_Test.php');
 		$this->addFile(TestPath . 'model/TextModel_Test.php');
 		$this->addFile(TestPath . 'model/PasswordModel_Test.php');
 		$this->addFile(TestPath . 'model/QuestionModel_Test.php');
 		$this->addFile(TestPath . 'model/AnswerModel_Test.php');
 		$this->addFile(TestPath . 'model/CommentModel_Test.php');
 		$this->addFile(TestPath . 'model/Roles_Test.php');
 		$this->addFile(TestPath . 'model/UserVoteModel_Test.php');
    }

}

?>
