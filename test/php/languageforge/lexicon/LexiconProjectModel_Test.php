<?php

use models\languageforge\lexicon\commands\LexCommentCommands;
use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\config\LexiconOptionListItem;
use models\languageforge\lexicon\LexOptionListModel;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\Example;
use models\languageforge\lexicon\LexComment;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\Sense;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexiconProjectModel extends UnitTestCase {

    function testInitializeNewProject_defaultPartOfSpeechOptionListExists() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $optionlists = new \models\languageforge\lexicon\LexOptionListListModel($project);
        $optionlists->read();

        $this->assertEqual(count($optionlists->entries), 0);

        $project = \models\ProjectModel::getById($project->id->asString());
        $project->initializeNewProject();

        $optionlists->read();

        $this->assertTrue(count($optionlists->entries) > 0);

        $this->assertEqual($optionlists->entries[0]['items'][0]['key'], 'adj');

    }
}

?>
