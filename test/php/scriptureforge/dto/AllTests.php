<?php

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllScriptureforgeDtoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'scriptureforge/dto/ActivityDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/ProjectPageDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/QuestionListDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/QuestionCommentDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/ProjectSettingsDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/TextSettingsDto_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/UsxHelper_Test.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/UsxTrimHelper_Test.php');
    }

}
