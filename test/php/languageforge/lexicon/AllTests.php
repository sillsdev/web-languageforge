<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllLexiconAppTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/LexEntryCommands_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/LexProjectCommands_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/LiftImport_Test.php');
    }

}

?>
