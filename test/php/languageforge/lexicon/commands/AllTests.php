<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconCommandsTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/LexEntryCommands_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/LexOptionListCommands_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/LexProjectCommands_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/LexCommentCommands_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/LexUploadCommands_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/SendReceiveCommands_Test.php');
    }

}
