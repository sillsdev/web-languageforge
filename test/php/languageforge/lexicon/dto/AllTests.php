<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconDtoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'languageforge/lexicon/dto/LexBaseViewDto_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/dto/LexDbeDto_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/dto/LexProjectDto_Test.php');
    }

}
