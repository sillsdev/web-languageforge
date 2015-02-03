<?php

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconDtoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/dto/LexBaseViewDto_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/dto/LexDbeDto_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/dto/LexProjectDto_Test.php');
    }

}
