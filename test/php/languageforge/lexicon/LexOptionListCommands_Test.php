<?php

use models\languageforge\lexicon\commands\LexCommentCommands;
use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexOptionListCommands;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\config\LexiconOptionListItem;
use models\languageforge\lexicon\LexOptionListListModel;
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
require_once(dirname(__FILE__) . '/LexTestData.php');

class TestLexOptionListCommands extends UnitTestCase {

	function testUpdateList() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();

		$project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

		$optionlists = new LexOptionListListModel($project);
		$optionlists->read();
		$project = \models\ProjectModel::getById($project->id->asString());
		$project->initializeNewProject();

		$optionlists->read();
		$initialCount = count($optionlists->entries[0]['items']);
		var_dump($initialCount);

		$fruits = array('a' => 'apple', 'b' => 'berry', 'c' => 'cherry', 'g' => 'grape', 'm' => 'mango', 'p' => 'pineapple');
		LexOptionListCommands::updateList($project->id->asString(), $fruits);

		$newCount = count($optionlists->entries[1]['items']);

		$this->assertTrue($initialCount != $newCount);


	}

}

?>