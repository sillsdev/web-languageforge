<?php


require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexiconProjectModel extends UnitTestCase
{
    public function testInitializeNewProject_defaultPartOfSpeechOptionListExists()
    {
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
