<?php

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconCommandsTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/commands/LexUploadCommands_Test.php');
    }

}
