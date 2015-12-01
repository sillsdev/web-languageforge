<?php
require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllModelTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'model/UserModel_Test.php');
        $this->addFile(TestPhpPath . 'model/ProjectModel_Test.php');
        $this->addFile(TestPhpPath . 'model/MultipleModel_Test.php');
        $this->addFile(TestPhpPath . 'model/TextModel_Test.php');
        $this->addFile(TestPhpPath . 'model/PasswordModel_Test.php');
        $this->addFile(TestPhpPath . 'model/QuestionModel_Test.php');
        $this->addFile(TestPhpPath . 'model/AnswerModel_Test.php');
        $this->addFile(TestPhpPath . 'model/CommentModel_Test.php');
        $this->addFile(TestPhpPath . 'model/Roles_Test.php');
        $this->addFile(TestPhpPath . 'model/UserVoteModel_Test.php');
        $this->addFile(TestPhpPath . 'model/UserUnreadModel_Test.php');
    }

}
